import type { Course } from "@/db/schema/course";
import { generateEmbedding } from "@/lib/ai/embedding";
import { getModel } from "@/lib/ai/models";
import { qdrant } from "@/qdrant/qdrant";
import { qdrantCollections } from "@/qdrant/qdrant-constants";
import type { QdrantPoints } from "@/types/qdrant";
import { type Message, generateText } from "ai";

type RelevantContentResult =
  | { success: true; data: QdrantPoints; error: null }
  | { success: false; data: null; error: string };

export const findRelevantContent = async ({
  userQuery,
  courseId,
}: {
  userQuery: string;
  courseId: Course["id"];
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
      limit: 5,
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

export const getRelevantChunks = async (
  messages: Message[],
  courseId: Course["id"],
) => {
  const generatedQuery = await generateText({
    model: getModel({ type: "small" }),
    messages,
    experimental_telemetry: { isEnabled: true },
    system: `Given the provided message history, formulate a short and precise query to search a RAG database for additional context. Take special notice of the user's most recent request. ONLY output the query and nothing else. NEVER output SQL, just the query.`,
  });

  console.log(`Generated query: ${generatedQuery.text}`);

  const result = await findRelevantContent({
    userQuery: generatedQuery.text,
    courseId,
  });

  if (!result.success) {
    console.error("Error finding relevant content:", result.error);
    return [];
  }

  if (!result.data?.points || result.data.points.length === 0) {
    console.log("No relevant content found");
    return [];
  }

  return result.data.points
    .map((point) => {
      if (!point.payload) return;

      return {
        text: point.payload.text,
        type: "reference",
      };
    })
    .filter(Boolean);
};
