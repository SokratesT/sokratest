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
  const variant = message.role === "user" ? "sent" : "received";

  const actionIcons = [
    { icon: CopyIcon, type: "Copy" },
    { icon: RefreshCcwIcon, type: "Regenerate" },
    { icon: ThumbsUpIcon, type: "Like" },
    { icon: ThumbsDownIcon, type: "Dislike" },
  ];

  const userActionIcons = [
    { icon: PencilIcon, type: "Edit" },
    { icon: CopyIcon, type: "Copy" },
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
              {userActionIcons.map(({ icon: Icon, type }) => (
                <ChatBubbleAction
                  className="size-6 text-primary"
                  actionLabel={type}
                  key={type}
                  icon={<Icon className="size-3" />}
                  onClick={() =>
                    console.log(
                      `Action ${type} clicked for message ${message.id}`,
                    )
                  }
                />
              ))}
            </ChatBubbleActionWrapper>
          )}
          {message.role === "assistant" && (
            <ChatBubbleActionWrapper variant="received" className="gap-2 pt-2">
              {actionIcons.map(({ icon: Icon, type }) => (
                <ChatBubbleAction
                  className="size-6"
                  actionLabel={type}
                  key={type}
                  icon={<Icon className="size-3" />}
                  onClick={() =>
                    console.log(
                      `Action ${type} clicked for message ${message.id}`,
                    )
                  }
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
