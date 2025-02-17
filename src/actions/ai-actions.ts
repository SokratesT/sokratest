"use server";

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/db/queries/ai-queries";
import { customModel } from "@/lib/ai";
import { type Message, generateText } from "ai";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
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
    prompt: JSON.stringify(message.content),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}
