"use client";

import { Button } from "@/components/ui/button";
import { SendButton, StopButton } from "@/components/ui/chat/chat-buttons";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useStreamingText } from "@/hooks/ai/useStreamingText";
import { type Message, useChat } from "ai/react";
import { MicIcon, PaperclipIcon } from "lucide-react";
import { MessageBlock } from "./MessageBlock";

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
}: { id: string; initialMessages: Message[] }) => {
  const {
    data: dataStream,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
    stop,
    reload,
  } = useChat({
    id,
    api: "/api/ai/chat",
    maxSteps: 5,
    initialMessages,
    onFinish: () => {
      resetStream();
    },
    sendExtraMessageFields: true,
  });

  const { toolStream, reset: resetStream } = useStreamingText(
    dataStream as DataStreamDelta[],
  );

  return (
    <div className="flex size-full min-h-0 min-w-0 flex-col gap-4 bg-background">
      <ChatMessageList>
        {messages.map((m: Message) => (
          <MessageBlock key={m.id} message={m} toolStream={toolStream} />
        ))}
      </ChatMessageList>

      <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
        <div className="relative flex w-full flex-col gap-4">
          <ChatInput
            onChange={handleInputChange}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            chatId={id}
            input={input}
            setInput={setInput}
            placeholder="Type your message here..."
          />

          <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
            <Button variant="ghost" size="icon">
              <PaperclipIcon className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <MicIcon className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>
          </div>

          <div className="absolute bottom-0 right-0 flex w-fit flex-row justify-end p-2">
            {isLoading ? (
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
