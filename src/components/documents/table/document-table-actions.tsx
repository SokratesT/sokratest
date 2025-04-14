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
import { deleteDocumentInfo } from "@/db/actions/document";
import { enqueueEmbeddings } from "@/db/actions/test-trigger";
import { withToastPromise } from "@/lib/utils";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const DocumentTableActions = () => {
  const { table } = useTable();
  const courseId = table.options.meta?.courseId;

  const handleDelete = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    toast.promise(
      withToastPromise(
        deleteDocumentInfo({ refs: fileIds.map((id) => ({ id })) }),
      ),
      {
        loading: "Deleting files...",
        success: "Files deleted",
        error: (error) => ({
          message: "Failed to delete files",
          description: error.message,
        }),
      },
    );
  };

  const handleEnqueueEmbeddings = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    toast.promise(withToastPromise(enqueueEmbeddings({ ids: fileIds })), {
      loading: "Enqueuing for embedding...",
      success: "Enqueued for embedding",
      error: (error) => ({
        message: "Failed to enqueue for embedding",
        description: error.message,
      }),
    });
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
        {courseId && (
          <DropdownMenuItem
            onClick={() => handleEnqueueEmbeddings()}
            disabled={table.getSelectedRowModel().rows.length === 0}
          >
            Generate Embeddings
          </DropdownMenuItem>
        )}

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

export { DocumentTableActions };
