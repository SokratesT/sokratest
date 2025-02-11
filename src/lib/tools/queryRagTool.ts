import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import { createOpenAI } from "@ai-sdk/openai";
import { type DataStreamWriter, embed, streamText, tool } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { customModel } from "../ai";

export const queryRagTool = (dataStream: DataStreamWriter) =>
  tool({
    description:
      "Use this tool to respond to questions. It will return some documents, which you should use to respond to the query.",
    parameters: z.object({
      query: z
        .string()
        .describe(
          "A detailed query to retrieve information about the user's latest question that takes the context of the current conversation into account.",
        ),
    }),
    execute: async ({ query }, { toolCallId }) => {
      const id = uuidv4();
      let draftText = "";

      console.log("QUERY: ", query);

      dataStream.writeData({
        type: "id",
        content: toolCallId,
      });

      /* dataStream.writeData({
        type: "title",
        content: query,
      });

      dataStream.writeData({
        type: "kind",
        content: "text",
      });

      dataStream.writeData({
        type: "clear",
        content: "",
      }); */

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
            name: embeddings.embedding,
            similarity,
            text: embeddings.text,
            fileId: embeddings.fileId,
          })
          .from(embeddings)
          .where(gt(similarity, 0.6))
          .orderBy((t) => desc(t.similarity))
          .limit(5);

        return similarGuides;
      };

      const context = await findRelevantContent(query);
      context.forEach((doc) => {
        dataStream.writeMessageAnnotation({ ...doc, type: "reference" });
      });

      const cont = context.map((doc) => ({
        fileId: doc.fileId,
        text: doc.text,
        similarity: doc.similarity,
      }));

      const { fullStream } = streamText({
        model: customModel({
          model: {
            id: "deepseek-r1:14b",
            label: "Deepseek R1",
            apiIdentifier: "deepseek-r1:14b",
            description: "Local R1",
          },
          mode: "local",
        }),
        experimental_telemetry: { isEnabled: true },
        system: `Respond to the query using the provided context. In your response, include citations by referencing the fileId that certain information correspond to like this: <fileId:{fileId}> \n The context: ${JSON.stringify(cont)}`,
        prompt: query,
      });

      for await (const chunk of fullStream) {
        if (chunk.type === "text-delta" && chunk.textDelta) {
          draftText += chunk.textDelta;
          dataStream.writeData({
            type: "text-delta",
            content: chunk.textDelta,
          });
        }
        console.log(chunk);
      }
      dataStream.writeData({ type: "finish", content: "" });

      /* return JSON.stringify(cont); */
      return draftText;
    },
  });
