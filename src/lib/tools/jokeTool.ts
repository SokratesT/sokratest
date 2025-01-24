import { type DataStreamWriter, streamText, tool } from "ai";
import { z } from "zod";
import { customModel } from "../ai";

export const jokeTool = (dataStream: DataStreamWriter) =>
  tool({
    description: "generate a joke",
    parameters: z.object({ topic: z.string() }),
    execute: async ({ topic }, { toolCallId }) => {
      let draftText = "";
      dataStream.writeData({
        type: "id",
        content: toolCallId,
      });

      const { fullStream } = streamText({
        model: customModel({ mode: "local" }),
        messages: [
          {
            role: "user",
            content: `Write a long joke about ${topic}.`,
          },
        ],
      });

      for await (const chunk of fullStream) {
        if (chunk.type === "text-delta" && chunk.textDelta) {
          draftText += chunk.textDelta;
          dataStream.writeData({
            type: "text-delta",
            content: chunk.textDelta,
          });
        }
      }

      dataStream.writeData({ type: "finish", content: "" });

      // Send final joke content
      return draftText;
    },
  });
