"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteTrailingMessages } from "@/db/actions/ai-actions";
import type { Chat } from "@/db/schema/chat";
import { type ChatUIMessage, getMessageText } from "@/lib/ai/chat-message";

type MessageEditorProps = {
  chatId: Chat["id"];
  message: ChatUIMessage;
  setMode: React.Dispatch<React.SetStateAction<"view" | "edit">>;
  sendMessage: UseChatHelpers<ChatUIMessage>["sendMessage"];
  status: UseChatHelpers<ChatUIMessage>["status"];
};

const adjustHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
};

const MessageEditor = ({
  chatId,
  message,
  setMode,
  sendMessage,
  status,
}: MessageEditorProps) => {
  const [draftContent, setDraftContent] = useState<string>(
    getMessageText(message),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight(textareaRef.current);
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight(event.target);
  };

  const handleEdit = async () => {
    const messageId = message.id;

    if (!messageId) {
      toast.error("Something went wrong, please try again!");
      return;
    }

    await deleteTrailingMessages({
      chatId,
      messageId: messageId,
    });

    setMode("view");
    // Replaces the edited message and drops all messages after it
    sendMessage({ text: draftContent, messageId });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        ref={textareaRef}
        className="w-full resize-none overflow-hidden rounded-xl bg-transparent text-base! outline-none dark:bg-transparent"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row justify-end gap-2 text-card-foreground">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMode("view");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={isLoading}
          onClick={handleEdit}
        >
          {isLoading ? "Generating..." : "Edit"}
        </Button>
      </div>
    </div>
  );
};

export { MessageEditor };
