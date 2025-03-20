import { db } from "@/db/drizzle";
import { embedding } from "@/db/schema/embedding";
import { getModel } from "@/lib/ai/models";
import { type Message, embed, generateText } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export const getRelevantChunks = async (messages: Message[]) => {
  const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll("\\n", " ");
    const { embedding } = await embed({
      model: getModel({ type: "embedding" }),
      value: input,
    });
    return embedding;
  };

  const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embedding.vector,
      userQueryEmbedded,
    )})`;
    const similarGuides = await db
      .select({
        similarity,
        text: embedding.text,
        fileId: embedding.fileId,
      })
      .from(embedding)
      .where(gt(similarity, 0))
      .orderBy((t) => desc(t.similarity))
      .limit(5);

    return similarGuides;
  };

  const generatedQuery = await generateText({
    model: getModel({ type: "small" }),
    messages,
    experimental_telemetry: { isEnabled: true },
    system: `Given the provided message history, formulate a short and precise query to search a RAG database for additional context. Take special notice of the user's most recent request. ONLY output the query and nothing else. NEVER output SQL, just the query.`,
  });

  console.log(`Generated query: ${generatedQuery.text}`);

  const context = await findRelevantContent(generatedQuery.text);

  return context.map((c) => ({
    ...c,
    type: "reference",
  }));
};
