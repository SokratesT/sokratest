"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat } from "@/db/actions/chat";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ChatCardOptions = ({ chatId }: { chatId: string }) => {
  const confirm = useConfirm();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDropdownOpen(false);

    const isConfirmed = await confirm({
      title: "Delete Chat",
      description: "Are you sure you want to delete this chat?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (isConfirmed) {
      toast.promise(deleteChat({ ids: [chatId] }), {
        loading: "Deleting chat...",
        success: "Chat deleted",
        error: "Failed to delete chat",
      });
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
