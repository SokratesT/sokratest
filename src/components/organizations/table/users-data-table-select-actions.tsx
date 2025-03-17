"use client";

import { revalidatePathFromClient } from "@/actions/revalidate-helper";
import { Button } from "@/components/ui/button";
import { useTable } from "@/components/ui/data-table/data-table-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const UsersDataTableSelectActions = () => {
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
      console.log("ORganization errors", errors.filter(Boolean));

      if (errors.filter(Boolean).length > 0) {
        toast.error("Something went wrong, please try again!");
      } else {
        toast.success("Organizations deleted");
      }
    });

    await revalidatePathFromClient({ path: routes.app.sub.organizations.path });
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
          onClick={handleDelete}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Delete selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UsersDataTableSelectActions };
