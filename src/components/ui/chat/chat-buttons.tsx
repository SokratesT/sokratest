import { sanitizeUIMessages } from "@/lib/ai/utils";
import type { Message } from "ai";
import { CornerDownLeft, StopCircleIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../button";

export const StopButton = ({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) => (
  <Button
    className="rounded-full"
    onClick={(event) => {
      event.preventDefault();
      stop();
      setMessages((messages) => sanitizeUIMessages(messages));
    }}
  >
    <StopCircleIcon />
  </Button>
);

export const SendButton = ({
  submitForm,
  input,
}: {
  submitForm: () => void;
  input: string;
}) => (
  <Button
    className="rounded-full"
    size="icon"
    onClick={(event) => {
      event.preventDefault();
      submitForm();
    }}
    disabled={input.length === 0}
  >
    <CornerDownLeft />
  </Button>
);
