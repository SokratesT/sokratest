"use server";

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/db/queries/ai-queries";
import { getModel } from "@/lib/ai/models";
import { authActionClient } from "@/lib/safe-action";
import { generateText } from "ai";
import { string, z } from "zod";

export const generateTitleFromUserMessage = authActionClient
  .metadata({ actionName: "generateTitleFromUserMessage" })
  .schema(z.object({ message: string() }))
  .action(async ({ parsedInput: { message } }) => {
    const { text: title } = await generateText({
      model: getModel({ type: "small" }),
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
