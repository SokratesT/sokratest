import { generateEmbedding } from "@/lib/ai/embedding";
import { getModel } from "@/lib/ai/models";
import { qdrant } from "@/qdrant/qdrant";
import { qdrantCollections } from "@/qdrant/qdrant-constants";
import { type Message, generateText } from "ai";

export const getRelevantChunks = async (
  messages: Message[],
  courseId: string,
) => {
  const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);

    const response = await qdrant.query(qdrantCollections.chunks.name, {
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
    });

    return response;
  };

  const generatedQuery = await generateText({
    model: getModel({ type: "small" }),
    messages,
    experimental_telemetry: { isEnabled: true },
    system: `Given the provided message history, formulate a short and precise query to search a RAG database for additional context. Take special notice of the user's most recent request. ONLY output the query and nothing else. NEVER output SQL, just the query.`,
  });

  console.log(`Generated query: ${generatedQuery.text}`);

  const points = (await findRelevantContent(generatedQuery.text)).points;

  return points.map((point) => {
    if (!point.payload) return;

    return {
      // TODO: Type properly
      text: point.payload.text,
      type: "reference",
    };
  });
};
