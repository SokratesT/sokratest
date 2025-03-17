"use client";

import { deleteChat } from "@/db/actions/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const ChatCardOptions = ({ chatId }: { chatId: string }) => {
  const onDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    await deleteChat({ ids: [chatId] }).then(() => {
      toast.success("Chat deleted");
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={onDelete}>Delete Chat</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ChatCardOptions };
