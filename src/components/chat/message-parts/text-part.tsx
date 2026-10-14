import type { UseChatHelpers } from "@ai-sdk/react";
import type { TextUIPart } from "ai";
import type { Dispatch, SetStateAction } from "react";
import { Markdown } from "@/components/chat/markdown";
import { MessageEditor } from "@/components/chat/message-editor";
import type { ChatUIMessage } from "@/lib/ai/chat-message";

interface TextPartProps {
  part: TextUIPart;
  variant: "sent" | "received";
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  message: ChatUIMessage;
  chatId: string;
  sendMessage: UseChatHelpers<ChatUIMessage>["sendMessage"];
  status: UseChatHelpers<ChatUIMessage>["status"];
}

export const TextPart = ({
  part,
  variant,
  mode,
  setMode,
  message,
  chatId,
  sendMessage,
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
            sendMessage={sendMessage}
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
