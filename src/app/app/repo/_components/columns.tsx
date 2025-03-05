"use client";

import { deleteFileInfo } from "@/actions/file-repository";
import { enqueueEmbeddings } from "@/actions/test-trigger";
import { Badge } from "@/components/ui/badge";
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
import type { FileRepository } from "@/db/schema/file-repository";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { convert } from "convert";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const handleDelete = async (id: string) => {
  deleteFileInfo({ ids: [id] });
  toast.success("File deleted");
};

const handleEnqueueEmbedding = async (id: string) => {
  enqueueEmbeddings({ ids: [id] });
  toast.success("Enqueued for embedding");
};

export const columns: ColumnDef<FileRepository>[] = [
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
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Name" />
    ),
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Size" />
    ),
    cell: ({ row }) => {
      return convert(row.original.size, "bytes").to("best").toString(2);
    },
  },
  {
    accessorKey: "embeddingStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Embedding" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          className={cn({
            "bg-emerald-600": row.original.embeddingStatus === "done",
            "bg-red-600": row.original.embeddingStatus === "failed",
            "bg-cyan-600": row.original.embeddingStatus === "outstanding",
            "bg-yellow-600": row.original.embeddingStatus === "processing",
          })}
        >
          {row.original.embeddingStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
  },
  {
    id: "actions",
    size: 32,
    cell: ({ row }) => {
      const file = row.original;

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
            <Link href={`/app/repo/edit/${file.id}`}>
              <DropdownMenuItem>Edit File</DropdownMenuItem>
            </Link>
            <Link href={`/app/repo/file/${file.id}`}>
              <DropdownMenuItem>View File</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => handleEnqueueEmbedding(file.id)}>
              Embed File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(file.id)}>
              Delete File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
