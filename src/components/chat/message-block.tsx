import type { UseChatHelpers } from "@ai-sdk/react";
import { isToolUIPart } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import type { Chat } from "@/db/schema/chat";
import type { ChatUIMessage } from "@/lib/ai/chat-message";
import { cn } from "@/lib/utils";
import { AnnotationBlock } from "./annotation-block";
import { MessageActions } from "./message-parts/message-actions";
import { ReasoningPart } from "./message-parts/reasoning-part";
import { TextPart } from "./message-parts/text-part";
import { ToolBlock } from "./tool-blocks/tool-block";

const MessageBlock = ({
  message,
  chatId,
  sendMessage,
  status,
  score,
}: {
  message: ChatUIMessage;
  chatId: Chat["id"];
  sendMessage: UseChatHelpers<ChatUIMessage>["sendMessage"];
  status: UseChatHelpers<ChatUIMessage>["status"];
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

  const hasContent = message.parts.some(
    (part) => part.type === "text" || part.type === "reasoning",
  );

  const references = message.parts.flatMap((part) =>
    part.type === "data-reference" ? [part.data] : [],
  );

  const toolStreams = new Map(
    message.parts.flatMap((part) =>
      part.type === "data-toolStream" && part.id
        ? [[part.id, part.data.text] as const]
        : [],
    ),
  );

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
            isLoading={!hasContent && status === "streaming"}
            variant={variant}
            className={cn(
              {
                "w-[calc(100dvw-31px)] rounded-none bg-transparent md:w-[calc(100dvw-316px)] lg:max-w-[800px]":
                  variant === "received",
              },
              "sticky",
            )}
          >
            {message.parts.map((part) => (
              <div key={part.type + message.id}>
                {part.type === "reasoning" && (
                  <ReasoningPart reasoning={part.text} />
                )}

                {part.type === "text" && (
                  <TextPart
                    part={part}
                    variant={variant}
                    mode={mode}
                    setMode={setMode}
                    message={message}
                    chatId={chatId}
                    sendMessage={sendMessage}
                    status={status}
                  />
                )}

                {isToolUIPart(part) && (
                  <ToolBlock
                    key={part.toolCallId}
                    tool={part}
                    toolStream={toolStreams.get(part.toolCallId)}
                  />
                )}
              </div>
            ))}

            <AnnotationBlock references={references} />
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
