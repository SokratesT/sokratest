import {
  type ModelMessage,
  streamText,
  tool,
  type UIMessageStreamWriter,
} from "ai";
import { z } from "zod";
import type { ChatUIMessage } from "@/lib/ai/chat-message";
import { getSaiaModel } from "@/lib/ai/saia-models";

export const finalResponseTool = (
  writer: UIMessageStreamWriter<ChatUIMessage>,
  messages: ModelMessage[],
) =>
  tool({
    description: "Use this tool to generate a final response to the user.",
    inputSchema: z.object({ topic: z.string() }),
    // biome-ignore lint/correctness/noUnusedFunctionParameters: <Needs refactor, but fine for now>
    execute: async ({ topic }, { toolCallId }) => {
      let draftText = "";

      const { stream } = streamText({
        model: getSaiaModel({
          input: ["text"],
          model: "llama-3.3-70b-instruct",
        }).provider,
        messages,
      });

      for await (const chunk of stream) {
        if (chunk.type === "text-delta" && chunk.text) {
          draftText += chunk.text;
          // Same id: each write replaces the tool's streaming text part
          writer.write({
            type: "data-toolStream",
            id: toolCallId,
            data: { text: draftText },
          });
        }
      }

      // Send final joke content
      return draftText;
    },
  });
