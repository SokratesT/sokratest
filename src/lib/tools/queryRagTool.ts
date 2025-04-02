import { findRelevantContent } from "@/app/api/ai/chat/ai-helper";
import type { Course } from "@/db/schema/course";
import { getModel } from "@/lib/ai/models";
import { type DataStreamWriter, embed, streamText, tool } from "ai";
import { z } from "zod";

export const queryRagTool = ({
  dataStream,
  courseId,
}: { dataStream: DataStreamWriter; courseId: Course["id"] }) =>
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
      let draftText = "";

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

      const generateEmbedding = async (value: string): Promise<number[]> => {
        const input = value.replaceAll("\\n", " ");
        const { embedding } = await embed({
          model: getModel({ type: "embedding" }),
          value: input,
        });
        return embedding;
      };

      const { points } = await findRelevantContent({
        userQuery: query,
        courseId,
      });
      points.forEach((point) => {
        dataStream.writeMessageAnnotation({
          text: point.payload.text,
          type: "reference",
        });
      });

      const cont = points.map((point) => ({
        fileId: point.payload.document_id,
        text: point.payload.text,
        similarity: point.score,
      }));

      const { fullStream } = streamText({
        model: getModel({ type: "chatReasoning" }),
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
