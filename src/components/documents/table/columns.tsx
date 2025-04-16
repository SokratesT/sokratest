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
import { enqueueDocuments } from "@/db/actions/test-trigger";
import type { Document } from "@/db/schema/document";
import { cn, withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { convert } from "convert";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const handleDelete = async (id: string) => {
  toast.promise(withToastPromise(deleteDocumentInfo({ refs: [{ id }] })), {
    loading: "Deleting document...",
    success: "Document deleted",
    error: (error) => ({
      message: "Failed to delete document",
      description: error.message,
    }),
  });
};

const handleEnqueueDocuments = async (id: string) => {
  toast.promise(withToastPromise(enqueueDocuments({ ids: [id] })), {
    loading: "Enqueuing documents for processing...",
    success: "Enqueued documents for processing",
    error: (error) => ({
      message: "Failed to enqueue documents for processing",
      description: error.message,
    }),
  });
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
            "bg-emerald-600": row.original.status === "ready",
            "bg-red-600": row.original.status === "failed",
            "bg-cyan-600": row.original.status === "pending",
            "bg-yellow-600": row.original.status === "processing-document",
            "bg-yellow-400": row.original.status === "generating-embedding",
          })}
        >
          {row.original.status}
        </Badge>
      );
    },
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
            <Link
              href={ROUTES.PRIVATE.documents.view.getPath({ id: document.id })}
            >
              <DropdownMenuItem>View Document</DropdownMenuItem>
            </Link>
            <Link
              href={ROUTES.PRIVATE.documents.edit.getPath({ id: document.id })}
            >
              <DropdownMenuItem>Edit Document</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => handleEnqueueDocuments(document.id)}
            >
              Process Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(document.id)}
            >
              Delete Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
