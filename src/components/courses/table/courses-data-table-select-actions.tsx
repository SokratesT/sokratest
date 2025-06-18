"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTable } from "@/components/ui/data-table/data-table-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { deleteCourses } from "@/db/actions/course";
import { withToastPromise } from "@/lib/utils";

const CoursesDataTableSelectActions = () => {
  const { table } = useTable();

  if (!table) return null;

  const handleDelete = async () => {
    const courseIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    toast.promise(
      withToastPromise(
        deleteCourses({ refs: courseIds.map((id) => ({ id })) }),
      ),
      {
        loading: "Deleting courses...",
        success: "Courses deleted",
        error: (error) => ({
          message: "Failed to delete courses",
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

export { CoursesDataTableSelectActions };
