import { generateText } from "ai";
import { saveChat } from "@/db/queries/ai-queries";
import type { User } from "@/db/schema/auth";
import type { Chat } from "@/db/schema/chat";
import type { ChatMessage } from "@/db/schema/chat-message";
import type { Course } from "@/db/schema/course";
import { startTrace } from "@/lib/langfuse/trace";
import { generateChatTitlePrompt } from "@/settings/prompts";
import type { ChatUIMessage } from "./chat-message";
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
  const title = await startTrace(
    {
      name: "chat-title",
      userId,
      sessionId: chatId,
      tags: ["system", "chat_title"],
      metadata: { courseId },
      input: message,
    },
    async (trace) => {
      const { text } = await generateText({
        model: getSaiaModel({
          input: ["text"],
          model: "meta-llama-3.1-8b-instruct",
        }).provider,
        instructions: generateChatTitlePrompt,
        prompt: message,
        telemetry: { functionId: "chat-title" },
      });

      trace.end({ output: text });

      return text;
    },
  );

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
