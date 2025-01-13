"use client";

import { createNewChat } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NewChatButton = () => {
  const router = useRouter();

  const handleNewChat = async () => {
    const chatId = await createNewChat();
    router.push(`/app/chat/${chatId}`);
  };

  return <Button onClick={handleNewChat}>New Chat</Button>;
};

export { NewChatButton };
