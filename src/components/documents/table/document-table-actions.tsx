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
import { enqueueDocuments } from "@/db/actions/test-trigger";
import { withToastPromise } from "@/lib/utils";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const DocumentTableActions = () => {
  const { table } = useTable();

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

  const handleEnqueueDocument = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    toast.promise(withToastPromise(enqueueDocuments({ ids: fileIds })), {
      loading: "Enqueuing document for processing...",
      success: "Enqueued document for processing",
      error: (error) => ({
        message: "Failed to enqueue document for processing",
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
        <DropdownMenuItem
          onClick={() => handleEnqueueDocument()}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Process Documents
        </DropdownMenuItem>
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
