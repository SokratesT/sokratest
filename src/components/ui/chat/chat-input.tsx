import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import { RefreshCcwIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { SendButton, StopButton } from "./chat-buttons";

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
  handleReload: () => void;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  input: string;
  setInput: (value: string) => void;
}

const ChatInput = ({
  className,
  status,
  chatId,
  handleSubmit,
  handleReload,
  setMessages,
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
    <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
      <div className="relative flex w-full flex-col gap-4">
        <Textarea
          data-slot="chat-input"
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          className={cn(
            "max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl bg-card pb-10 text-base!",
            className,
          )}
          rows={props.rows ?? 2}
          autoFocus
          maxLength={5000}
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

        <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleReload}
          >
            <RefreshCcwIcon className="size-4" />
            <span className="sr-only">Regenerate last message</span>
          </Button>
        </div>

        <div className="absolute right-0 bottom-0 flex w-fit flex-row justify-end p-2">
          {status === "streaming" || status === "submitted" ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <SendButton input={input} submitForm={submitForm} />
          )}
        </div>
      </div>
    </form>
  );
};

export { ChatInput };
