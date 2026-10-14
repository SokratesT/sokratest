import { generateText } from "ai";
import { saveChat } from "@/db/queries/ai-queries";
import type { User } from "@/db/schema/auth";
import type { Chat } from "@/db/schema/chat";
import type { ChatMessage } from "@/db/schema/chat-message";
import type { Course } from "@/db/schema/course";
import { generateChatTitlePrompt } from "@/settings/prompts";
import type { ChatUIMessage } from "./chat-message";
import { getSaiaModel } from "./saia-models";
import { withTelemetryMetadata } from "./telemetry";

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
    instructions: generateChatTitlePrompt,
    prompt: message,
    ...withTelemetryMetadata({
      sessionId: chatId,
      courseId,
      userId,
      tags: ["system", "chat_title"],
    }),
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
): Array<ChatUIMessage> {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.parts,
  }));
}

export function getMostRecentUserMessage(messages: Array<ChatUIMessage>) {
  return messages.findLast((message) => message.role === "user");
}
