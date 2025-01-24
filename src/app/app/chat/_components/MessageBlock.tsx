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
import { AnnotationBlock } from "./AnnotationBlock";
import { ToolBlock } from "./tool-blocks/ToolBlock";

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

  return (
    <ChatBubble
      variant={variant}
      className={cn("items-start", { "max-w-full": variant === "received" })}
    >
      {variant === "received" && (
        <ChatBubbleAvatar
          Fallback={message.role === "user" ? UserIcon : BotIcon}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
      >
        <ChatBubbleMessage
          variant={variant}
          className={cn(
            {
              "w-full rounded-none bg-transparent": variant === "received",
            },
            "sticky",
          )}
        >
          <Markdown>{message.content as string}</Markdown>
          <p className="font-bold">Tools</p>

          {message.toolInvocations?.map((tool) => {
            return (
              <ToolBlock
                key={tool.toolCallId}
                tool={tool}
                toolStream={toolStream?.[tool.toolCallId]?.content}
              />
            );
          })}
          <p className="font-bold">Annotations</p>
          <AnnotationBlock annotations={message.annotations} />

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
