"use client";

import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat } from "@/db/actions/chat";
import { withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ChatActionsDropdown = ({
  children,
  chatId,
}: { children: React.ReactElement; chatId: string }) => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
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

    const test = await deleteChat({
      refs: [{ id: chatId }],
    });

    if (isConfirmed) {
      toast.promise(withToastPromise(deleteChat({ refs: [{ id: chatId }] })), {
        loading: "Deleting chat...",
        success: "Chat deleted",
        error: (error) => ({
          message: "Failed to delete chat",
          description: error.message,
        }),
      });

      if (params.id && params.id === chatId) {
        router.replace(ROUTES.PRIVATE.root.getPath());
      }
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
