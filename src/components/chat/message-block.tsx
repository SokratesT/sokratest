import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import type { Chat } from "@/db/schema/chat";
import { cn } from "@/lib/utils";
import { AnnotationBlock } from "./annotation-block";
import { MessageActions } from "./message-parts/message-actions";
import { ReasoningPart } from "./message-parts/reasoning-part";
import { TextPart } from "./message-parts/text-part";
import { ToolBlock } from "./tool-blocks/tool-block";

interface ToolStream {
  [key: string]: {
    content: string | undefined;
  };
}

const MessageBlock = ({
  message,
  chatId,
  toolStream,
  setMessages,
  reload,
  status,
  score,
}: {
  message: Message;
  chatId: Chat["id"];
  toolStream: ToolStream | null;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  status: UseChatHelpers["status"];
  score?: ApiGetScoresResponseData;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const handleModeChange = () => {
    if (mode === "view") {
      setMode("edit");
    } else {
      setMode("view");
    }
  };

  const variant = message.role === "user" ? "sent" : "received";

  return (
    <ChatBubble
      variant={variant}
      className={cn("items-start", {
        "max-w-full": variant === "received",
      })}
    >
      <AnimatePresence>
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          data-role={message.role}
        >
          <ChatBubbleMessage
            isLoading={message.parts?.length === 0 && status === "streaming"}
            variant={variant}
            className={cn(
              {
                "w-[calc(100dvw-31px)] rounded-none bg-transparent md:w-[calc(100dvw-316px)] lg:max-w-[800px]":
                  variant === "received",
              },
              "sticky",
            )}
          >
            {message.parts?.map((part) => (
              <div key={part.type + message.id}>
                {part.type === "reasoning" && (
                  <ReasoningPart reasoning={part.reasoning} />
                )}

                {part.type === "text" && (
                  <TextPart
                    part={part}
                    variant={variant}
                    mode={mode}
                    setMode={setMode}
                    message={message}
                    chatId={chatId}
                    setMessages={setMessages}
                    reload={reload}
                    status={status}
                  />
                )}

                {part.type === "tool-invocation" && (
                  <ToolBlock
                    key={part.toolInvocation.toolCallId}
                    tool={part.toolInvocation}
                    toolStream={
                      toolStream?.[part.toolInvocation.toolCallId]?.content
                    }
                  />
                )}
              </div>
            ))}

            <AnnotationBlock annotations={message.annotations} />
            <MessageActions
              message={message}
              chatId={chatId}
              score={score}
              handleModeChange={handleModeChange}
            />
          </ChatBubbleMessage>
        </motion.div>
      </AnimatePresence>
    </ChatBubble>
  );
};

export { MessageBlock };
