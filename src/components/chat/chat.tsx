"use client";

import { Button } from "@/components/ui/button";
import { SendButton, StopButton } from "@/components/ui/chat/chat-buttons";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { deleteTrailingMessages } from "@/db/actions/ai-actions";
import { useStreamingText } from "@/hooks/use-streaming-text";
import { type Message, useChat } from "@ai-sdk/react";
import type { ApiGetScoresResponseData } from "langfuse";
import { RefreshCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { MessageBlock } from "./message-block";

type DataStreamDelta = {
  type:
    | "text-delta"
    | "code-delta"
    | "image-delta"
    | "title"
    | "id"
    | "suggestion"
    | "clear"
    | "finish"
    | "user-message-id"
    | "kind";
  content: string;
};

const Chat = ({
  id,
  initialMessages,
  scores,
}: {
  id: string;
  initialMessages: Message[];
  scores: ApiGetScoresResponseData[];
}) => {
  const {
    data: dataStream,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    setInput,
    stop,
    reload,
  } = useChat({
    id,
    body: { id },
    api: "/api/ai/chat",
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: uuidv4,
    initialMessages,
    onFinish: () => {
      resetStream();
    },
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });

  const { toolStream, reset: resetStream } = useStreamingText(
    dataStream as DataStreamDelta[],
  );

  const handleReload = () => {
    deleteTrailingMessages({
      chatId: id,
      messageId: messages[messages.length - 1].id,
    }).then(() => {
      reload();
    });
  };

  return (
    <div className="flex size-full min-h-0 min-w-0 flex-col gap-4 bg-background">
      <ChatMessageList>
        {messages.map((m: Message) => (
          <MessageBlock
            key={m.id}
            message={m}
            chatId={id}
            toolStream={toolStream}
            setMessages={setMessages}
            reload={reload}
            status={status}
            score={scores.find((s) => s.id === m.id)}
          />
        ))}
      </ChatMessageList>

      <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
        <div className="relative flex w-full flex-col gap-4">
          <ChatInput
            onChange={handleInputChange}
            status={status}
            handleSubmit={handleSubmit}
            chatId={id}
            input={input}
            setInput={setInput}
            placeholder="Type your message here..."
          />

          <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReload}
            >
              <RefreshCcwIcon className="size-4" />
              <span className="sr-only">Regenerate last message</span>
            </Button>
          </div>

          <div className="absolute right-0 bottom-0 flex w-fit flex-row justify-end p-2">
            {status === "streaming" || status === "submitted" ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton input={input} submitForm={handleSubmit} />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export { Chat };
