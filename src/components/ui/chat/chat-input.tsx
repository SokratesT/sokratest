import type { UseChatHelpers } from "@ai-sdk/react";
import { CompassIcon, RefreshCcwIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { AppTourButton } from "@/components/next-step/app-tour-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { UserPreferencesType } from "@/db/schema/auth";
import { useUmami } from "@/hooks/use-umami";
import type { ChatUIMessage } from "@/lib/ai/chat-message";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import { SendButton, StopButton } from "./chat-buttons";

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: UseChatHelpers<ChatUIMessage>["status"];
  chatId: string;
  sendMessage: UseChatHelpers<ChatUIMessage>["sendMessage"];
  handleReload: () => void;
  setMessages: UseChatHelpers<ChatUIMessage>["setMessages"];
  stop: () => void;
  hasMessages: boolean;
  preferences: UserPreferencesType;
}

const ChatInput = ({
  className,
  status,
  chatId,
  sendMessage,
  handleReload,
  setMessages,
  stop,
  hasMessages,
  preferences,
  ...props
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const { width } = useWindowSize();
  const { trackEvent } = useUmami();
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
    if (!input) return;

    window.history.replaceState(
      {},
      "",
      ROUTES.PRIVATE.chat.view.getPath({ id: chatId }),
    );

    trackEvent("chat-request", { chatId });

    sendMessage({ text: input /* files: attachments */ });

    // setAttachments([]);
    setInput("");
    setLocalStorageInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    // attachments,
    input,
    sendMessage,
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

        <div className="absolute bottom-0 flex w-fit flex-row justify-start gap-1 p-2">
          {hasMessages && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleReload}
            >
              <RefreshCcwIcon className="size-4" />
              <span className="sr-only">Regenerate last message</span>
            </Button>
          )}

          <AppTourButton
            tour="chatTour"
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            autoTrigger={
              !preferences.tours?.chatTour && status === "ready" && hasMessages
            }
          >
            <CompassIcon className="size-4" />
            <span className="sr-only">Regenerate last message</span>
          </AppTourButton>
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
