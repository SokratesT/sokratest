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
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const DocumentTableActions = () => {
  const { table } = useTable();
  const courseId = table.options.meta?.courseId;

  const handleDelete = async () => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    deleteDocumentInfo({ ids: fileIds });
    toast.success("Files deleted");
  };

  const handleEnqueueEmbeddings = async (courseId: string) => {
    const fileIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    enqueueEmbeddings({ ids: fileIds, courseId });
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
        {courseId && (
          <DropdownMenuItem
            onClick={() => handleEnqueueEmbeddings(courseId)}
            disabled={table.getSelectedRowModel().rows.length === 0}
          >
            Generate Embeddings
          </DropdownMenuItem>
        )}

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

export { DocumentTableActions };
