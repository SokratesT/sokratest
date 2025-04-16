"use client";

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
import { revalidatePathFromClient } from "@/db/actions/revalidate-helper";
import type { Organization } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const handleDelete = async (id: string) => {
  toast.promise(authClient.organization.delete({ organizationId: id }), {
    loading: "Deleting organisation...",
    success: "Organisation deleted",
    error: (error) => ({
      message: "Failed to delete organisation",
      description: error.message,
    }),
  });

  await revalidatePathFromClient({
    path: ROUTES.PRIVATE.organizations.root.getPath(),
  });
};

export const organizationTableColumns: ColumnDef<Organization>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
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
      const user = row.original;

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
              href={ROUTES.PRIVATE.organizations.view.getPath({ id: user.id })}
            >
              <DropdownMenuItem>View Organisation</DropdownMenuItem>
            </Link>
            <Link
              href={ROUTES.PRIVATE.organizations.edit.getPath({ id: user.id })}
            >
              <DropdownMenuItem>Edit Organisation</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(user.id)}
            >
              Delete Organisation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
