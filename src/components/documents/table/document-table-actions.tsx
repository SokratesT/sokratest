"use client";

import { Button } from "@/components/ui/button";
import { useTable } from "@/components/ui/data-table/data-table-context";
import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { enqueueDocuments } from "@/db/actions/test-trigger";
import { handleDeleteDocuments } from "@/lib/client-actions/document";
import { withToastPromise } from "@/lib/utils";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const DocumentTableActions = () => {
  const { table } = useTable();
  const confirm = useConfirm();

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
          onClick={async () =>
            await handleDeleteDocuments({
              confirm,
              refs: table
                .getSelectedRowModel()
                .flatRows.map((row) => ({ id: row.id })),
            })
          }
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Delete selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { DocumentTableActions };
