-- AI SDK 4 -> AI SDK 5+ UIMessage persistence (see src/lib/ai/chat-message.ts).
-- Every step only touches rows/parts that are still in the old shape, so the
-- file can be re-run safely (steps 2-4 are skipped once the columns are gone).

-- 0. The columns are `json`, which accepts the `\u0000` escape; `jsonb` does
--    not, and every step below casts to jsonb. Strip the escape first.
UPDATE "chat_message"
SET "parts" = replace("parts"::text, E'\\u0000', '')::json
WHERE position(E'\\u0000' in "parts"::text) > 0;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = current_schema() AND table_name = 'chat_message' AND column_name = 'attachments'
	) THEN
		UPDATE "chat_message"
		SET "attachments" = replace("attachments"::text, E'\\u0000', '')::json
		WHERE position(E'\\u0000' in "attachments"::text) > 0;
	END IF;
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = current_schema() AND table_name = 'chat_message' AND column_name = 'annotations'
	) THEN
		UPDATE "chat_message"
		SET "annotations" = replace("annotations"::text, E'\\u0000', '')::json
		WHERE position(E'\\u0000' in "annotations"::text) > 0;
	END IF;
END $$;
--> statement-breakpoint
-- 1. Convert AI SDK 4 parts in place. Text and step-start parts keep their
--    shape; reasoning, tool invocation, source and file parts are rewritten.
--    Tool invocations without a result (aborted calls) are dropped.
UPDATE "chat_message" AS m
SET "parts" = converted."parts"::json
FROM (
	SELECT
		c."id",
		COALESCE(
			jsonb_agg(p."part" ORDER BY p."ord") FILTER (WHERE p."part" IS NOT NULL),
			'[]'::jsonb
		) AS "parts"
	FROM (
		SELECT
			"id",
			CASE WHEN jsonb_typeof("parts"::jsonb) = 'array' THEN "parts"::jsonb ELSE '[]'::jsonb END AS "parts"
		FROM "chat_message"
	) AS c
	CROSS JOIN LATERAL (
		SELECT
			e."ord",
			CASE
				WHEN e."part"->>'type' = 'reasoning' AND e."part" ? 'reasoning' THEN
					jsonb_build_object('type', 'reasoning', 'text', e."part"->>'reasoning')
				WHEN e."part"->>'type' = 'tool-invocation' AND e."part"->'toolInvocation'->>'state' = 'result' THEN
					jsonb_build_object(
						'type', 'tool-' || (e."part"->'toolInvocation'->>'toolName'),
						'toolCallId', e."part"->'toolInvocation'->>'toolCallId',
						'state', 'output-available',
						'input', COALESCE(e."part"->'toolInvocation'->'args', '{}'::jsonb),
						'output', e."part"->'toolInvocation'->'result'
					)
				WHEN e."part"->>'type' = 'tool-invocation' THEN NULL
				WHEN e."part"->>'type' = 'source' AND e."part" ? 'source' THEN
					jsonb_strip_nulls(jsonb_build_object(
						'type', 'source-url',
						'sourceId', e."part"->'source'->>'id',
						'url', e."part"->'source'->>'url',
						'title', e."part"->'source'->>'title'
					))
				WHEN e."part"->>'type' = 'file' AND e."part" ? 'mimeType' AND e."part" ? 'data' THEN
					jsonb_build_object(
						'type', 'file',
						'mediaType', e."part"->>'mimeType',
						'url', CASE
							WHEN e."part"->>'data' ~ '^(data:|https?://)' THEN e."part"->>'data'
							ELSE 'data:' || (e."part"->>'mimeType') || ';base64,' || (e."part"->>'data')
						END
					)
				ELSE e."part"
			END AS "part"
		FROM jsonb_array_elements(c."parts") WITH ORDINALITY AS e("part", "ord")
	) AS p
	WHERE EXISTS (
		SELECT 1
		FROM jsonb_array_elements(c."parts") AS v4("part")
		WHERE (v4."part"->>'type' = 'reasoning' AND v4."part" ? 'reasoning')
			OR v4."part"->>'type' = 'tool-invocation'
			OR (v4."part"->>'type' = 'source' AND v4."part" ? 'source')
			OR (v4."part"->>'type' = 'file' AND v4."part" ? 'mimeType')
	)
	GROUP BY c."id"
) AS converted
WHERE m."id" = converted."id";
--> statement-breakpoint
-- 2. Attachments (`experimental_attachments`: { name?, contentType?, url })
--    become file parts, placed before the existing parts like `sendMessage`
--    does. Attachments whose URL is already present as a file part are skipped.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = current_schema() AND table_name = 'chat_message' AND column_name = 'attachments'
	) THEN
		UPDATE "chat_message" AS m
		SET "parts" = (files."parts" || m."parts"::jsonb)::json
		FROM (
			SELECT
				c."id",
				jsonb_agg(
					jsonb_strip_nulls(jsonb_build_object(
						'type', 'file',
						'mediaType', COALESCE(e."attachment"->>'contentType', 'application/octet-stream'),
						'filename', e."attachment"->>'name',
						'url', e."attachment"->>'url'
					))
					ORDER BY e."ord"
				) AS "parts"
			FROM "chat_message" AS c
			CROSS JOIN LATERAL jsonb_array_elements(
				CASE WHEN jsonb_typeof(c."attachments"::jsonb) = 'array' THEN c."attachments"::jsonb ELSE '[]'::jsonb END
			) WITH ORDINALITY AS e("attachment", "ord")
			WHERE jsonb_typeof(c."parts"::jsonb) = 'array'
				AND e."attachment"->>'url' IS NOT NULL
				AND NOT c."parts"::jsonb @> jsonb_build_array(
					jsonb_build_object('type', 'file', 'url', e."attachment"->>'url')
				)
			GROUP BY c."id"
		) AS files
		WHERE m."id" = files."id";
	END IF;
END $$;
--> statement-breakpoint
-- 3. Document references written with `writeMessageAnnotation`
--    ({ id, title, metadata, type: 'reference' }, stored as objects or JSON
--    strings) become `data-reference` parts appended to the parts. References
--    already present as a `data-reference` part with the same id are skipped.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = current_schema() AND table_name = 'chat_message' AND column_name = 'annotations'
	) THEN
		UPDATE "chat_message" AS m
		SET "parts" = (m."parts"::jsonb || refs."parts")::json
		FROM (
			SELECT
				c."id",
				jsonb_agg(
					jsonb_build_object(
						'type', 'data-reference',
						'id', a."annotation"->>'id',
						'data', jsonb_build_object(
							'id', a."annotation"->>'id',
							'title', a."annotation"->>'title',
							'metadata', CASE
								WHEN jsonb_typeof(a."annotation"->'metadata') = 'object' THEN a."annotation"->'metadata'
								ELSE '{}'::jsonb
							END
						)
					)
					ORDER BY e."ord"
				) AS "parts"
			FROM "chat_message" AS c
			CROSS JOIN LATERAL jsonb_array_elements(
				CASE WHEN jsonb_typeof(c."annotations"::jsonb) = 'array' THEN c."annotations"::jsonb ELSE '[]'::jsonb END
			) WITH ORDINALITY AS e("annotation", "ord")
			CROSS JOIN LATERAL (
				SELECT CASE
					WHEN jsonb_typeof(e."annotation") = 'string' AND (e."annotation" #>> '{}') IS JSON OBJECT
						THEN (e."annotation" #>> '{}')::jsonb
					ELSE e."annotation"
				END AS "annotation"
			) AS a
			WHERE jsonb_typeof(c."parts"::jsonb) = 'array'
				AND jsonb_typeof(a."annotation") = 'object'
				AND a."annotation"->>'type' = 'reference'
				AND jsonb_typeof(a."annotation"->'id') = 'string'
				AND jsonb_typeof(a."annotation"->'title') = 'string'
				AND NOT c."parts"::jsonb @> jsonb_build_array(
					jsonb_build_object('type', 'data-reference', 'id', a."annotation"->>'id')
				)
			GROUP BY c."id"
		) AS refs
		WHERE m."id" = refs."id";
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN IF EXISTS "attachments";--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN IF EXISTS "annotations";
