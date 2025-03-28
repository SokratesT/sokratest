"use client";

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
import { deleteDocumentInfo } from "@/db/actions/document";
import { enqueueEmbeddings } from "@/db/actions/test-trigger";
import type { Document } from "@/db/schema/document";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { convert } from "convert";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const handleDelete = async (id: string) => {
  deleteDocumentInfo({ ids: [id] });
  toast.success("Document deleted");
};

const handleEnqueueEmbedding = async (id: string) => {
  enqueueEmbeddings({ ids: [id] });
  toast.success("Enqueued for embedding");
};

export const columns: ColumnDef<Document>[] = [
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
    accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
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
      const document = row.original;

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
            <Link
              href={ROUTES.PRIVATE.documents.edit.getPath({ id: document.id })}
            >
              <DropdownMenuItem>Edit Document</DropdownMenuItem>
            </Link>
            <Link
              href={ROUTES.PRIVATE.documents.view.getPath({ id: document.id })}
            >
              <DropdownMenuItem>View Document</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => handleEnqueueEmbedding(document.id)}
            >
              Embed Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(document.id)}>
              Delete Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
