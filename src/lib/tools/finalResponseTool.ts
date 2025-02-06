import { type DataStreamWriter, type Message, streamText, tool } from "ai";
import { z } from "zod";
import { customModel } from "../ai";

export const finalResponseTool = (
  dataStream: DataStreamWriter,
  messages: Message[],
) =>
  tool({
    description: "Use this tool to generate a final response to the user.",
    parameters: z.object({ topic: z.string() }),
    execute: async ({ topic }, { toolCallId }) => {
      let draftText = "";
      dataStream.writeData({
        type: "id",
        content: toolCallId,
      });

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
        messages,
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
