import type { Message } from "ai";
import type { ApiGetScoresResponseData } from "langfuse";
import { CopyIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { MessageRate } from "@/components/chat/message-rate";
import {
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from "@/components/ui/chat/chat-bubble";

export const MessageActions = ({
  message,
  chatId,
  score,
  handleModeChange,
}: {
  message: Message;
  chatId: string;
  score?: ApiGetScoresResponseData;
  handleModeChange: () => void;
}) => {
  const [, copy] = useCopyToClipboard();

  const handleCopy = async (text: string) => {
    toast.promise(copy(text), {
      loading: "Copying to clipboard...",
      success: "Copied to clipboard!",
      error: (error) => ({
        message: "Failed to copy to clipboard",
        description: error.message,
      }),
    });
  };

  const copyAction = {
    icon: CopyIcon,
    type: "Copy",
    fn: () =>
      handleCopy(
        message.parts?.find((part) => part.type === "text")?.text ?? "",
      ),
  };

  if (message.role === "user") {
    const userActions = [
      { icon: PencilIcon, type: "Edit", fn: handleModeChange },
      copyAction,
    ];

    return (
      <ChatBubbleActionWrapper variant="sent" className="w-full gap-2 pt-2">
        {userActions.map(({ icon: Icon, type, fn }) => (
          <ChatBubbleAction
            className="size-6 text-primary"
            actionLabel={type}
            key={type}
            icon={<Icon className="size-3" />}
            onClick={fn}
          />
        ))}
      </ChatBubbleActionWrapper>
    );
  }

  // Assistant actions
  const assistantActions = [copyAction];

  return (
    <ChatBubbleActionWrapper variant="received" className="gap-2 pt-2">
      {assistantActions.map(({ icon: Icon, type, fn }) => (
        <ChatBubbleAction
          className="size-6"
          actionLabel={type}
          key={type}
          icon={<Icon className="size-3" />}
          onClick={fn}
        />
      ))}
      <MessageRate chatId={chatId} messageId={message.id} score={score} />
    </ChatBubbleActionWrapper>
  );
};
