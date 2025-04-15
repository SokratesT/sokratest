import { db } from "@/db/drizzle";
import type { Course } from "@/db/schema/course";
import { document } from "@/db/schema/document";
import { generateEmbedding } from "@/lib/ai/embedding";
import { getModel } from "@/lib/ai/models";
import { qdrant } from "@/qdrant/qdrant";
import { qdrantCollections } from "@/qdrant/qdrant-constants";
import type { QdrantPoints } from "@/types/qdrant";
import { type Message, generateText } from "ai";
import { inArray } from "drizzle-orm";

type RelevantContentResult =
  | { success: true; data: QdrantPoints; error: null }
  | { success: false; data: null; error: string };

export const findRelevantContent = async ({
  userQuery,
  courseId,
  limit = 5,
}: {
  userQuery: string;
  courseId: Course["id"];
  limit?: number;
}): Promise<RelevantContentResult> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  if (userQueryEmbedded.length !== qdrantCollections.chunks.dimensions) {
    return {
      success: false,
      data: null,
      error: "Invalid embedding dimensions",
    };
  }

  try {
    const response = (await qdrant.query(qdrantCollections.chunks.name, {
      query: userQueryEmbedded,
      filter: {
        must: [
          {
            key: qdrantCollections.chunks.index.courseId,
            match: {
              value: courseId,
            },
          },
        ],
      },
      limit,
      with_payload: true,
    })) as QdrantPoints;

    return { success: true, data: response, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error during query";
    console.error("Qdrant query error:", errorMessage);
    return { success: false, data: null, error: errorMessage };
  }
};

export const getRelevantChunks = async ({
  messages,
  courseId,
  limit,
}: {
  messages: Message[];
  courseId: Course["id"];
  limit: number;
}) => {
  const generatedQuery = await generateText({
    model: getModel({ type: "small" }),
    messages,
    experimental_telemetry: { isEnabled: true },
    system: `Briefly summarise the provided message history, putting special emphasis on the users latest message and particularly any questions they may have. The summary should be in the form of a question, and should be no longer than 20 words.`,
  });

  console.log(`Generated query: ${generatedQuery.text}`);

  const result = await findRelevantContent({
    userQuery: generatedQuery.text,
    courseId,
    limit,
  });

  if (!result.success) {
    console.error("Error finding relevant content:", result.error);
    return [];
  }

  if (!result.data?.points || result.data.points.length === 0) {
    console.log("No relevant content found");
    return [];
  }

  const chunks = result.data.points
    .map((point) => {
      // Check that payload exists and has required properties
      if (!point.payload || !point.payload.document_id || !point.payload.text) {
        return undefined;
      }

      return {
        documentId: point.payload.document_id,
        text: point.payload.text,
        type: "reference",
      };
    })
    .filter(Boolean) as Array<{
    documentId: string;
    text: string;
    type: string;
  }>;

  return chunks;
};

export const getDocumentReferencesByIds = async (documentIds: string[]) => {
  const query = await db
    .select({
      id: document.id,
      title: document.title,
      metadata: document.metadata,
    })
    .from(document)
    .where(inArray(document.id, documentIds));

  const filteredQuery = query.filter(
    (doc) => doc.metadata.showReference === true,
  );

  return filteredQuery.map((doc) => ({
    ...doc,
    type: "reference",
  }));
};
