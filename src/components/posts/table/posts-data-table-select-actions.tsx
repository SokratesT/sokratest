"use client";

import { Button } from "@/components/ui/button";
import { useTable } from "@/components/ui/data-table/data-table-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { deletePosts } from "@/db/actions/post";
import { withToastPromise } from "@/lib/utils";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const PostsDataTableSelectActions = () => {
  const { table } = useTable();

  if (!table) return null;

  const handleDelete = async () => {
    const postIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    toast.promise(
      withToastPromise(deletePosts({ refs: postIds.map((id) => ({ id })) })),
      {
        loading: "Deleting posts...",
        success: "Posts deleted",
        error: (error) => ({
          message: "Failed to delete posts",
          description: error.message,
        }),
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <ReplaceAllIcon />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDelete}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Delete selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { PostsDataTableSelectActions };
