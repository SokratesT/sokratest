"use server";

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/db/queries/ai-queries";
import { customModel } from "@/lib/ai";
import { authActionClient } from "@/lib/safe-action";
import { generateText } from "ai";
import { string, z } from "zod";

export const generateTitleFromUserMessage = authActionClient
  .metadata({ actionName: "generateTitleFromUserMessage" })
  .schema(z.object({ message: string() }))
  .action(async ({ parsedInput: { message } }) => {
    const { text: title } = await generateText({
      model: customModel({
        model: {
          id: "meta-llama-3.1-8b-instruct",
          label: "Llama 3.1 (8b)",
          apiIdentifier: "meta-llama-3.1-8b-instruct",
          description: "Model description for 3.1 8b",
        },
        mode: "saia",
      }),
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
      prompt: message,
    });

    return { title, error: null };
  });

export const deleteTrailingMessages = authActionClient
  .metadata({ actionName: "deleteTrailingMessages" })
  .schema(z.object({ id: string() }))
  .action(async ({ parsedInput: { id } }) => {
    const [message] = await getMessageById({ id });

    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  });
