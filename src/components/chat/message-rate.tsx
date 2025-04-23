"use client";

import { Button } from "@/components/ui/button";
import { voteMessage } from "@/db/actions/chat-message-vote";
import type { Chat } from "@/db/schema/chat";
import type { ChatMessage } from "@/db/schema/chat-message";
import type { ApiGetScoresResponseData } from "langfuse";
import { CheckIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";

const MessageRate = ({
  messageId,
  chatId,
  score,
}: {
  messageId: ChatMessage["id"];
  chatId: Chat["id"];
  score?: ApiGetScoresResponseData;
}) => {
  const [optimisticScore, setOptimisticScore] = useState<
    number | undefined | null
  >(score?.value);

  const handleVote = async (sentiment: number) => {
    toast.promise(
      voteMessage({
        messageId,
        sentiment,
        chatId,
      }),
      {
        loading: "Rating...",
        success: () => {
          setOptimisticScore(sentiment);
          return "Thank you for your feedback!";
        },
        error: (error) => {
          setOptimisticScore(score?.value);

          return {
            message: "Failed to rate",
            description: error.message,
          };
        },
      },
    );
  };

  const ratings = [
    { label: "Very much", value: 10 },
    { label: "A bit", value: 5 },
    { label: "Not really", value: -5 },
    { label: "Not at all", value: -10 },
  ];

  return (
    <div className="flex flex-col gap-0.5 rounded-sm border p-0.5">
      <span className="w-full px-1 text-muted-foreground text-xs">
        Was this response helpful for your learning?
      </span>
      <div className="flex items-center gap-2">
        {ratings.map((rating) => (
          <RateButton
            onClick={() => handleVote(rating.value)}
            checked={optimisticScore === rating.value}
            key={rating.value}
          >
            {rating.label}
          </RateButton>
        ))}
      </div>
    </div>
  );
};

const RateButton = ({
  checked,
  ...props
}: { checked: boolean } & ComponentProps<"button">) => {
  return (
    <Button variant="ghost" className="h-5 px-1 text-xs" {...props}>
      <span className="flex items-center gap-1">
        {checked && <CheckIcon className="size-3" />}
        {props.children}
      </span>
    </Button>
  );
};

export { MessageRate };
