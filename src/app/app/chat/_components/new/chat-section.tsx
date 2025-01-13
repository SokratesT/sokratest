import { useState } from "react";
// import ChatInput from "./chat-input";
// import ChatMessages from "./chat-messages";
import { ChatProvider } from "./chat.context";
import { type ChatHandler } from "./chat.interface";
import { cn } from "@/lib/utils";

export interface ChatSectionProps extends React.PropsWithChildren {
  handler: ChatHandler;
  className?: string;
}

export default function ChatSection(props: ChatSectionProps) {
  const { handler, className } = props;
  const [requestData, setRequestData] = useState<any>();

  return (
    <ChatProvider value={{ ...handler, requestData, setRequestData }}>
      <div className={cn("flex flex-col gap-4", className)}>
        {props.children}
      </div>
    </ChatProvider>
  );
}
