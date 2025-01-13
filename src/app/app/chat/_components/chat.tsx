"use client";

import { saveMessage } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { messages } from "@/db/schema/chat";
import { Message, useChat } from "ai/react";
import { InferSelectModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import ChatInput from "./new/chat-input";
import ChatMessages from "./new/chat-messages";
import ChatSection from "./new/chat-section";
import { testAction } from "./test-action";

const Chat = ({
  chatHistory,
  chatId,
}: {
  chatHistory?: InferSelectModel<typeof messages>[];
  chatId: string;
}) => {
  const router = useRouter();

  const messages = chatHistory?.map((m) => {
    const c = m.content as Message;
    return { ...c, id: m.id };
  });

  const handler = useChat({
    // TODO: Remove hardcoded API URL
    api: "/api/ai/chat",
    initialMessages: messages,
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      let errorMessage: string;
      try {
        errorMessage = JSON.parse(error.message).detail;
      } catch (e) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    },
    onFinish: async (message) => {
      await saveMessage(message, chatId);
    },
  });

  return (
    <ChatSection handler={handler} className="h-full w-full">
      <ChatMessages className="h-full">
        <ChatMessages.List className="h-[800px]" />
      </ChatMessages>
      <ChatInput chatId={chatId} />
      <Button onClick={testAction}>Test</Button>
    </ChatSection>
  );
};

export { Chat };
