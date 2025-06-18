import { type DataStreamWriter, type Message, streamText, tool } from "ai";
import { z } from "zod";
import { getSaiaModel } from "@/lib/ai/saia-models";

export const finalResponseTool = (
  dataStream: DataStreamWriter,
  messages: Message[],
) =>
  tool({
    description: "Use this tool to generate a final response to the user.",
    parameters: z.object({ topic: z.string() }),
    // biome-ignore lint/correctness/noUnusedFunctionParameters: <Needs refactor, but fine for now>
    execute: async ({ topic }, { toolCallId }) => {
      let draftText = "";
      dataStream.writeData({
        type: "id",
        content: toolCallId,
      });

      const { fullStream } = streamText({
        model: getSaiaModel({
          input: ["text"],
          model: "llama-3.3-70b-instruct",
        }).provider,
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
