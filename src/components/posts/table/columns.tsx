"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePosts } from "@/db/actions/post";
import type { Post } from "@/db/schema/post";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PostWithAuthor extends Post {
  name: string | null;
}

const handleDelete = async (id: string) => {
  deletePosts({ refs: [{ id }] });
  toast.success("Post deleted");
};

export const columns: ColumnDef<PostWithAuthor>[] = [
  {
    id: "select",
    size: 32,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    size: 500,
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span>{format(row.original.createdAt || "", "MMM dd, yyyy HH:mm")}</span>
    ),
  },
  {
    id: "actions",
    size: 32,
    cell: ({ row }) => {
      const post = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/app/posts/edit/${post.id}`}>
              <DropdownMenuItem>Edit Post</DropdownMenuItem>
            </Link>
            <Link href={`/blog/${post.id}`}>
              <DropdownMenuItem>View Post</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(post.id)}>
              Delete Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
