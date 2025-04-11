"use client";

import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat } from "@/db/actions/chat";
import { useState } from "react";
import { toast } from "sonner";

const ChatActionsDropdown = ({
  children,
  chatId,
}: { children: React.ReactElement; chatId: string }) => {
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
      toast.promise(deleteChat({ refs: [{ id: chatId }] }), {
        loading: "Deleting chat...",
        success: "Chat deleted",
        error: "Failed to delete chat",
      });
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ChatActionsDropdown };
