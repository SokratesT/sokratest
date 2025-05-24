import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import type { Chat } from "@/db/schema/chat";
import { cn } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { CopyIcon, PencilIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { AnnotationBlock } from "./annotation-block";
import { Markdown } from "./markdown";
import { MessageEditor } from "./message-editor";
import { MessageRate } from "./message-rate";
import { ToolBlock } from "./tool-blocks/tool-block";

interface ToolStream {
  [key: string]: {
    content: string | undefined;
  };
}

// TODO: This is a mess. Refactor into composable components

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
  const [, copy] = useCopyToClipboard();

  const handleCopy = async (text: string) => {
    toast.promise(copy(text), {
      loading: "Copying to clipboard...",
      success: "Copied to clipboard!",
      error: (error) => ({
        message: "Failed to copy to clipboard",
        description: error.message,
      }),
    });
  };

  const handleModeChange = () => {
    if (mode === "view") {
      setMode("edit");
    } else {
      setMode("view");
    }
  };

  const variant = message.role === "user" ? "sent" : "received";

  const actionIcons = [
    {
      icon: CopyIcon,
      type: "Copy",
      fn: () =>
        handleCopy(
          message.parts?.find((message) => message.type === "text")?.text ?? "",
        ),
    },
  ];

  const userActionIcons = [
    { icon: PencilIcon, type: "Edit", fn: handleModeChange },
    {
      icon: CopyIcon,
      type: "Copy",
      fn: () =>
        handleCopy(
          message.parts?.find((message) => message.type === "text")?.text ?? "",
        ),
    },
  ];

  return (
    <ChatBubble
      variant={variant}
      className={cn("items-start", {
        "max-w-full": variant === "received",
      })}
    >
      {/* {variant === "received" && (
        <ChatBubbleAvatar
          className="mt-4"
          Fallback={message.role === "user" ? UserIcon : BotIcon}
        />
      )} */}
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
                  <Accordion
                    type="single"
                    collapsible
                    key={part.type}
                    className="mb-4 rounded-2xl border bg-card px-4"
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="py-2">
                        Show Reasoning
                      </AccordionTrigger>
                      <AccordionContent>
                        <Markdown className="text-sm">
                          {part.reasoning}
                        </Markdown>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {part.type === "text" && variant === "sent" && (
                  <div>
                    {mode === "edit" ? (
                      <MessageEditor
                        chatId={chatId}
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                        status={status}
                      />
                    ) : (
                      part.text
                    )}
                  </div>
                )}

                {part.type === "text" && variant === "received" && (
                  <Markdown className="text-foreground">{part.text}</Markdown>
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

            <AnnotationBlock
              annotations={message.annotations}
              id="ai-annotations"
            />
            {message.role === "user" && (
              <ChatBubbleActionWrapper
                variant="sent"
                className="w-full gap-2 pt-2"
              >
                {userActionIcons.map(({ icon: Icon, type, fn }) => (
                  <ChatBubbleAction
                    className="size-6 text-primary"
                    actionLabel={type}
                    key={type}
                    icon={<Icon className="size-3" />}
                    onClick={fn}
                  />
                ))}
              </ChatBubbleActionWrapper>
            )}
            {message.role === "assistant" && (
              <ChatBubbleActionWrapper
                variant="received"
                className="gap-2 pt-2"
              >
                {actionIcons.map(({ icon: Icon, type, fn }) => (
                  <ChatBubbleAction
                    className="size-6"
                    actionLabel={type}
                    key={type}
                    icon={<Icon className="size-3" />}
                    onClick={fn}
                  />
                ))}
                <MessageRate
                  chatId={chatId}
                  messageId={message.id}
                  score={score}
                  id="ai-message-rate"
                />
              </ChatBubbleActionWrapper>
            )}
          </ChatBubbleMessage>
        </motion.div>
      </AnimatePresence>
    </ChatBubble>
  );
};

export { MessageBlock };
