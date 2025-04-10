"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCourseInvitations } from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { ROUTES } from "@/settings/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const handleDelete = async (id: CourseInvitation["id"]) => {
  toast.promise(
    deleteCourseInvitations({
      refs: [{ id }],
    }),
    {
      loading: "Deleting course invitation...",
      success: "Course invitation deleted",
      error: "Error deleting course invitation",
    },
  );
};

const handleCopy = (id: CourseInvitation["id"]) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${ROUTES.PUBLIC.signup.getPath({ inv: id })}`;
  navigator.clipboard.writeText(url);
  toast.success("Invitation link copied to clipboard");
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
    size: 500,
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires At" />
    ),
    cell: ({ row }) => (
      <span>{format(row.original.createdAt || "", "MMM dd, yyyy HH:mm")}</span>
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleCopy(invitation.id)}>
              Copy Invitation Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(invitation.id)}>
              Delete Invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
