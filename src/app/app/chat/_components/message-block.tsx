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
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { cn } from "@/lib/utils";
import type { Message } from "ai";
import { motion } from "framer-motion";
import {
  BotIcon,
  CopyIcon,
  PencilIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Markdown } from "../../chat/_components/markdown";
import { AnnotationBlock } from "./annotation-block";
import { ToolBlock } from "./tool-blocks/tool-block";

interface ToolStream {
  [key: string]: {
    content: string | undefined;
  };
}

const MessageBlock = ({
  message,
  toolStream,
}: {
  message: Message;
  toolStream: ToolStream | null;
}) => {
  const [, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard");
        console.error("Failed to copy to clipboard", error);
      });
  };

  const variant = message.role === "user" ? "sent" : "received";

  const actionIcons = [
    { icon: CopyIcon, type: "Copy", fn: handleCopy(message.content) },
    {
      icon: RefreshCcwIcon,
      type: "Regenerate",
      fn: () => console.log("Regenerate clicked"),
    },
    { icon: ThumbsUpIcon, type: "Like", fn: () => console.log("Like clicked") },
    {
      icon: ThumbsDownIcon,
      type: "Dislike",
      fn: () => console.log("Dislike clicked"),
    },
  ];

  const userActionIcons = [
    { icon: PencilIcon, type: "Edit", fn: () => console.log("Edit clicked") },
    { icon: CopyIcon, type: "Copy", fn: handleCopy(message.content) },
  ];

  // Temporarily disables displaying tool invocations
  /* if (message.toolInvocations) return null; */

  return (
    <ChatBubble
      variant={variant}
      className={cn("items-start", { "max-w-full": variant === "received" })}
    >
      {variant === "received" && (
        <ChatBubbleAvatar
          className="mt-4"
          Fallback={message.role === "user" ? UserIcon : BotIcon}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
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
                  className="mb-4 max-w-[500px] rounded-2xl bg-accent px-4 font-mono"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="py-2">
                      {message.content === ""
                        ? "Thinking..."
                        : "Thinking steps"}
                    </AccordionTrigger>
                    <AccordionContent className="">
                      <Markdown className="font-mono text-sm">
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
                <Markdown className="text-secondary-foreground">
                  {part.text}
                </Markdown>
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
                  onClick={() => fn()}
                />
              ))}
            </ChatBubbleActionWrapper>
          )}
          {message.role === "assistant" && (
            <ChatBubbleActionWrapper variant="received" className="gap-2 pt-2">
              {actionIcons.map(({ icon: Icon, type, fn }) => (
                <ChatBubbleAction
                  className="size-6"
                  actionLabel={type}
                  key={type}
                  icon={<Icon className="size-3" />}
                  onClick={fn}
                />
              ))}
            </ChatBubbleActionWrapper>
          )}
        </ChatBubbleMessage>
      </motion.div>
    </ChatBubble>
  );
};

export { MessageBlock };
