import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatRequestOptions } from "ai";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isLoading?: boolean;
  chatId: string;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  input: string;
  setInput: (value: string) => void;
}

const ChatInput = ({
  className,
  isLoading,
  chatId,
  handleSubmit,
  input,
  setInput,
  ...props
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

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

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    "",
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/app/chat/${chatId}`);

    handleSubmit(
      /* undefined, {
        experimental_attachments: attachments,
      } */
    );

    // setAttachments([]);
    setLocalStorageInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    // attachments,
    handleSubmit,
    // setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  return (
    <Textarea
      data-slot="chat-input"
      ref={textareaRef}
      value={input}
      onChange={handleInput}
      className={cn(
        "max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-10 text-base! dark:border-zinc-700",
        className,
      )}
      rows={props.rows ?? 2}
      autoFocus
      placeholder={props.placeholder}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          if (isLoading) {
            toast.error("Please wait for the current response to finish.");
          } else {
            submitForm();
          }
        }
      }}
    />
  );
};

export { ChatInput };
