import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { voteMessage } from "@/db/actions/chat-message-vote";
import type { Chat } from "@/db/schema/chat";
import { cn } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { CheckIcon, CopyIcon, PencilIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { AnnotationBlock } from "./annotation-block";
import { Markdown } from "./markdown";
import { MessageEditor } from "./message-editor";
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

  const [optimisticScore, setOptimisticScore] = useState<
    number | undefined | null
  >(score?.value);

  const handleVote = async (sentiment: number) => {
    toast.promise(
      voteMessage({
        messageId: message.id,
        sentiment,
        chatId,
      }),
      {
        loading: "Rating...",
        success: () => {
          setOptimisticScore(sentiment);
          return "Thank you for your feedback!";
        },
        error: (error) => {
          setOptimisticScore(score?.value);

          return {
            message: "Failed to rate",
            description: error.message,
          };
        },
      },
    );
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
                "w-full rounded-none bg-transparent": variant === "received",
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
                    className="mb-4 max-w-[500px] rounded-2xl bg-accent px-4 font-mono text-accent-foreground"
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="py-2">
                        {message.content === ""
                          ? "Reasoning..."
                          : "Reasoning steps"}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Markdown className="font-mono text-accent-foreground text-sm">
                          {part.reasoning}
                        </Markdown>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {part.type === "text" && variant === "sent" && (
                  <div>{part.text}</div>
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

            <AnnotationBlock annotations={message.annotations} />
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
                {/** TODO: Add optimistic updates and refactor as separate component */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="h-6 px-2 text-xs">
                      {optimisticScore !== undefined ? (
                        <span className="flex items-center gap-2">
                          Rated <CheckIcon className="size-3" />
                        </span>
                      ) : (
                        <span>Rate</span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Rate Response</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      onClick={() => handleVote(10)}
                      checked={optimisticScore === 10}
                    >
                      Excellent
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      onClick={() => handleVote(5)}
                      checked={optimisticScore === 5}
                    >
                      Good
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      onClick={() => handleVote(-5)}
                      checked={optimisticScore === -5}
                    >
                      Poor
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      onClick={() => handleVote(-10)}
                      checked={optimisticScore === -10}
                    >
                      Terrible
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ChatBubbleActionWrapper>
            )}
          </ChatBubbleMessage>
          {message.content && mode === "edit" && (
            <div className="mt-10 flex flex-row items-start gap-2">
              <MessageEditor
                chatId={chatId}
                key={message.id}
                message={message}
                setMode={setMode}
                setMessages={setMessages}
                reload={reload}
                status={status}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </ChatBubble>
  );
};

export { MessageBlock };
