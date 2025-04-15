"use client";

import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteChat, renameChat } from "@/db/actions/chat";
import { withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ChatActionsDropdown = ({
  children,
  chatId,
  title,
}: { children: React.ReactElement; chatId: string; title: string | null }) => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const confirm = useConfirm();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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

  const onRename = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDropdownOpen(false);

    const isConfirmed = await confirm({
      title: "Rename Chat",
      description: "Enter a new name for this chat",
      contentSlot: (
        <Input
          ref={inputRef}
          placeholder="New chat name"
          defaultValue={title || ""}
          max={250}
          min={1}
          required
        />
      ),
      confirmText: "Rename",
      cancelText: "Cancel",
    });

    if (isConfirmed) {
      const newTitle = inputRef.current?.value || "";
      toast.promise(
        withToastPromise(renameChat({ id: chatId, title: newTitle })),
        {
          loading: "Renaming chat...",
          success: "Chat renamed",
          error: (error) => ({
            message: "Failed to rename chat",
            description: error.message,
          }),
        },
      );

      if (params.id && params.id === chatId) {
        router.replace(ROUTES.PRIVATE.root.getPath());
      }
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={onRename}>Rename Chat</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ChatActionsDropdown };
