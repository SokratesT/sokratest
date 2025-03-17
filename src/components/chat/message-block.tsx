import { voteMessage } from "@/actions/chat-message-vote";
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
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ChatRequestOptions, Message } from "ai";
import { BotIcon, CopyIcon, PencilIcon, UserIcon } from "lucide-react";
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

const MessageBlock = ({
  message,
  toolStream,
  setMessages,
  reload,
  isLoading,
}: {
  message: Message;
  toolStream: ToolStream | null;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isLoading: boolean;
}) => {
  const [, copy] = useCopyToClipboard();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const handleCopy = async (text: string) => {
    const isCopied = await copy(text);

    if (isCopied) {
      toast.success("Copied to clipboard!");
      return;
    }
    toast.error("Failed to copy to clipboard");
  };

  const handleVote = async (sentiment: number) => {
    await voteMessage({
      messageId: message.id,
      sentiment,
    }).then((res) => {
      res?.data?.error
        ? toast.error("Failed to rate")
        : toast.success("Rated successfully");
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
    { icon: CopyIcon, type: "Copy", fn: () => handleCopy(message.content) },
  ];

  const userActionIcons = [
    { icon: PencilIcon, type: "Edit", fn: handleModeChange },
    { icon: CopyIcon, type: "Copy", fn: () => handleCopy(message.content) },
  ];

  return (
    <ChatBubble
      variant={variant}
      className={cn("items-start", {
        "max-w-full": variant === "received",
      })}
    >
      {variant === "received" && (
        <ChatBubbleAvatar
          className="mt-4"
          Fallback={message.role === "user" ? UserIcon : BotIcon}
        />
      )}
      <AnimatePresence>
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          // data-role={message.role}
        >
          <ChatBubbleMessage
            isLoading={message.parts?.length === 0}
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
                          ? "Thinking..."
                          : "Thinking steps"}
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

            {message.annotations && (
              <AnnotationBlock annotations={message.annotations} />
            )}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 px-2 text-xs">
                      Rate
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Rate Response</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleVote(10)}>
                      Excellent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVote(5)}>
                      Good
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVote(-5)}>
                      Poor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVote(-10)}>
                      Terrible
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ChatBubbleActionWrapper>
            )}
          </ChatBubbleMessage>
          {message.content && mode === "edit" && (
            <div className="mt-10 flex flex-row items-start gap-2">
              <MessageEditor
                key={message.id}
                message={message}
                setMode={setMode}
                setMessages={setMessages}
                reload={reload}
                isLoading={isLoading}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </ChatBubble>
  );
};

export { MessageBlock };
