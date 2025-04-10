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
import { revalidatePathFromClient } from "@/db/actions/revalidate-helper";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const OrganizationTableActions = () => {
  const { table } = useTable();

  const handleDelete = async () => {
    const organizationIds = table
      .getSelectedRowModel()
      .flatRows.map((row) => row.id);

    const deletions = organizationIds.map((organizationId) => {
      const result = authClient.organization
        .delete({ organizationId })
        .then((result) => result.error);

      if (result) return result;
    });

    Promise.all(deletions).then((errors) => {
      console.error("Organization errors", errors.filter(Boolean));

      if (errors.filter(Boolean).length > 0) {
        toast.error("Something went wrong, please try again!");
      } else {
        toast.success("Organizations deleted");
      }
    });

    await revalidatePathFromClient({
      path: ROUTES.PRIVATE.organizations.root.getPath(),
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

export { OrganizationTableActions };
