"use client";

import { deleteChat } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const DeleteChatButton = ({ chatId }: { chatId: string }) => {
  const router = useRouter();

  const handleNewChat = async () => {
    await deleteChat(chatId);
  };

  return (
    <Button variant="destructive" onClick={handleNewChat}>
      Delete
    </Button>
  );
};

export { DeleteChatButton };
