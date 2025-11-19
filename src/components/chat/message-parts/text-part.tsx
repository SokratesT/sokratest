import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import type { Dispatch, SetStateAction } from "react";
import { Markdown } from "@/components/chat/markdown";
import { MessageEditor } from "@/components/chat/message-editor";

interface TextPartProps {
  part: { type: "text"; text: string };
  variant: "sent" | "received";
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  message: Message;
  chatId: string;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  status: UseChatHelpers["status"];
}

export const TextPart = ({
  part,
  variant,
  mode,
  setMode,
  message,
  chatId,
  setMessages,
  reload,
  status,
}: TextPartProps) => {
  if (variant === "sent") {
    return (
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
    );
  }

  return <Markdown className="text-foreground">{part.text}</Markdown>;
};
