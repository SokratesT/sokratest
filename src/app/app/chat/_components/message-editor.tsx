"use client";

import { deleteTrailingMessages } from "@/actions/ai-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatRequestOptions, Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type MessageEditorProps = {
  message: Message;
  setMode: React.Dispatch<React.SetStateAction<"view" | "edit">>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isLoading: boolean;
};

export function MessageEditor({
  message,
  setMode,
  setMessages,
  reload,
  isLoading,
}: MessageEditorProps) {
  const [draftContent, setDraftContent] = useState<string>(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        ref={textareaRef}
        className="!text-base w-full resize-none overflow-hidden rounded-xl bg-transparent outline-none"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          className="h-fit px-3 py-2"
          onClick={() => {
            setMode("view");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className="h-fit px-3 py-2"
          disabled={isLoading}
          onClick={async () => {
            const messageId = message.id;

            if (!messageId) {
              toast.error("Something went wrong, please try again!");
              return;
            }

            await deleteTrailingMessages({
              id: messageId,
            });

            setMessages((messages) => {
              const index = messages.findIndex((m) => m.id === message.id);

              if (index !== -1) {
                const updatedMessage: Message = {
                  ...message,
                  parts: message.parts?.map((part) => {
                    if (part.type === "text") {
                      return {
                        ...part,
                        text: draftContent,
                      };
                    }

                    return part;
                  }),
                  content: draftContent,
                };

                return [...messages.slice(0, index), updatedMessage];
              }

              return messages;
            });

            setMode("view");
            reload();
          }}
        >
          {isLoading ? "Generating..." : "Edit"}
        </Button>
      </div>
    </div>
  );
}
