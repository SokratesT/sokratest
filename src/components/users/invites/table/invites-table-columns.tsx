"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCourseInvitations } from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const handleDelete = async (id: CourseInvitation["id"]) => {
  toast.promise(
    withToastPromise(
      deleteCourseInvitations({
        refs: [{ id }],
      }),
    ),
    {
      loading: "Deleting course invitation...",
      success: "Course invitation deleted",
      error: (error) => ({
        message: "Failed to delete course invitation",
        description: error.message,
      }),
    },
  );
};

const handleCopy = async (id: CourseInvitation["id"]) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${ROUTES.PUBLIC.signup.getPath({ inv: id })}`;

  toast.promise(navigator.clipboard.writeText(url), {
    loading: "Copying invitation link...",
    success: "Invitation link copied",
    error: (error) => ({
      message: "Failed to copy invitation link",
      description: error.message,
    }),
  });
};

export const invitesTableColumns: ColumnDef<CourseInvitation>[] = [
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invitation ID" />
    ),
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires At" />
    ),
    cell: ({ row }) => (
      <span>{format(row.original.expiresAt || "", "MMM dd, yyyy HH:mm")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  },
  {
    id: "actions",
    size: 32,
    cell: ({ row }) => {
      const invitation = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCopy(invitation.id)}>
              Copy Invitation Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(invitation.id)}
            >
              Delete Invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
