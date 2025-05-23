import { saveChat } from "@/db/queries/ai-queries";
import type { User } from "@/db/schema/auth";
import type { Chat } from "@/db/schema/chat";
import type { ChatMessage } from "@/db/schema/chat-message";
import type { Course } from "@/db/schema/course";
import { generateChatTitlePrompt } from "@/settings/prompts";
import {
  type Attachment,
  type Message,
  type UIMessage,
  generateText,
} from "ai";
import { getSaiaModel } from "./saia-models";

export const createNewChat = async ({
  message,
  chatId,
  userId,
  courseId,
}: {
  message: string;
  chatId: Chat["id"];
  userId: User["id"];
  courseId: Course["id"];
}) => {
  const { text: title } = await generateText({
    model: getSaiaModel({
      input: ["text"],
      model: "meta-llama-3.1-8b-instruct",
    }).provider,
    system: generateChatTitlePrompt,
    prompt: message,
    experimental_telemetry: {
      isEnabled: true,
      metadata: {
        sessionId: chatId,
        courseId,
        userId,
        tags: ["system", "chat_title"],
      },
    },
  });

  await saveChat({
    id: chatId,
    userId,
    courseId,
    title,
  });

  return { title };
};

export function convertToUIMessages(
  messages: Array<ChatMessage>,
): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    // Note: content will soon be deprecated in @ai-sdk/react
    content: "",
    annotations: message.annotations as UIMessage["annotations"],
    createdAt: message.createdAt,
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}
