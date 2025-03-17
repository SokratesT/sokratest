"use client";

import { deleteDocumentInfo } from "@/actions/document";
import { enqueueEmbeddings } from "@/actions/test-trigger";
import { Button } from "@/components/ui/button";
import { useTable } from "@/components/ui/data-table/data-table-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const FilesDataTableSelectActions = () => {
  const { table } = useTable();

  const handleDelete = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    deleteDocumentInfo({ ids: fileIds });
    toast.success("Files deleted");
  };

  const handleEnqueueEmbeddings = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    enqueueEmbeddings({ ids: fileIds });
    toast.success("Files enqueued for embeddings");
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
          onClick={handleEnqueueEmbeddings}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Generate Embeddings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Delete selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { FilesDataTableSelectActions };
