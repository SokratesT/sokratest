"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { deleteTrailingMessages } from "@/db/actions/ai-actions";
import type { UserPreferencesType } from "@/db/schema/auth";
import { type ChatUIMessage, chatDataPartSchemas } from "@/lib/ai/chat-message";
import { ROUTES } from "@/settings/routes";
import { ChatPlaceholder } from "./chat-placeholder";
import { MessageBlock } from "./message-block";
import { ShinyText } from "./shiny-text";

const Chat = ({
  id,
  initialMessages,
  scores,
  preferences,
}: {
  id: string;
  initialMessages: ChatUIMessage[];
  scores: ApiGetScoresResponseData[];
  preferences: UserPreferencesType;
}) => {
  const { messages, sendMessage, status, setMessages, stop, regenerate } =
    useChat<ChatUIMessage>({
      id,
      messages: initialMessages,
      transport: new DefaultChatTransport({
        api: ROUTES.API.ai.chat.getPath(),
      }),
      dataPartSchemas: chatDataPartSchemas,
      throttle: 100,
      generateId: uuidv4,
      onError: (error) => {
        toast.error("An error occurred, please try again!", {
          description: error.message,
        });
      },
    });

  const handleReload = () => {
    deleteTrailingMessages({
      chatId: id,
      messageId: messages[messages.length - 1].id,
    }).then(() => {
      regenerate();
    });
  };

  return (
    <div className="flex size-full min-h-0 min-w-0 flex-col gap-4 bg-background">
      <ChatMessageList>
        {messages.map((m) => (
          <MessageBlock
            key={m.id}
            message={m}
            chatId={id}
            sendMessage={sendMessage}
            status={status}
            score={scores.find((s) => s.id === m.id)}
          />
        ))}
        {messages.length === 0 && <ChatPlaceholder />}
        {status === "submitted" && (
          <div className="sticky m-0 w-full max-w-full whitespace-pre-wrap break-words rounded-none bg-transparent p-4 text-foreground">
            <ShinyText>Gathering information...</ShinyText>
          </div>
        )}
        {status === "error" && (
          <div className="sticky m-0 w-full max-w-full whitespace-pre-wrap break-words rounded-none bg-transparent p-4 text-foreground">
            Something went wrong. Please try again.
          </div>
        )}
      </ChatMessageList>

      <ChatInput
        hasMessages={messages.length > 0}
        status={status}
        sendMessage={sendMessage}
        handleReload={handleReload}
        setMessages={setMessages}
        chatId={id}
        stop={stop}
        placeholder="How can I help?"
        preferences={preferences}
      />
    </div>
  );
};

export { Chat };
