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
import { removeCourseMembers } from "@/db/actions/course";
import type { Course } from "@/db/schema/course";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const CourseMemberTableActions = ({ courseId }: { courseId: Course["id"] }) => {
  const { table } = useTable();

  const handleDelete = async () => {
    const userIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    await removeCourseMembers({
      refs: userIds.map((id) => ({ id })),
      courseId,
    });

    toast.success("Members deleted");
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
          variant="destructive"
          onClick={handleDelete}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Remove selected members
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { CourseMemberTableActions };
