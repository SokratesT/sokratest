import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions } from "ai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: UseChatHelpers["status"];
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
  status,
  chatId,
  handleSubmit,
  input,
  setInput,
  ...props
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const isLoading = status === "streaming" || status === "submitted";

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
    window.history.replaceState(
      {},
      "",
      ROUTES.PRIVATE.chat.view.getPath({ id: chatId }),
    );

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
        "max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-10 text-base! dark:bg-secondary",
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
