import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import { customModel } from "@/lib/ai";
import { createOpenAI } from "@ai-sdk/openai";
import { type Message, embed, generateText } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export const getRelevantChunks = async (messages: Message[]) => {
  const openai = createOpenAI({
    // custom settings, e.g.
    compatibility: "compatible",
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
    name: "ollama",
  });

  const embeddingModel = openai.embedding("mxbai-embed-large:latest");

  const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll("\\n", " ");
    const { embedding } = await embed({
      model: embeddingModel,
      value: input,
    });
    return embedding;
  };

  const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;
    const similarGuides = await db
      .select({
        similarity,
        text: embeddings.text,
        fileId: embeddings.fileId,
      })
      .from(embeddings)
      .where(gt(similarity, 0))
      .orderBy((t) => desc(t.similarity))
      .limit(5);

    return similarGuides;
  };

  const generatedQuery = await generateText({
    model: customModel({
      model: {
        id: "llama3.1",
        label: "Llama 3.1",
        apiIdentifier: "llama3.1:latest",
        description: "Local Llama",
      },
      mode: "local",
    }),
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
