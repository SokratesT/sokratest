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
import type { Organization } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ReplaceAllIcon } from "lucide-react";
import { toast } from "sonner";

const OrganizationMemberTableActions = ({
  organizationId,
}: { organizationId: Organization["id"] }) => {
  const { table } = useTable();

  const handleDelete = async () => {
    const userIds = table.getSelectedRowModel().flatRows.map((row) => row.id);

    userIds.forEach((userId) =>
      authClient.organization
        .removeMember({ organizationId, memberIdOrEmail: userId })
        .then((result) => result.error),
    );

    toast.success("Organisation members deleted");
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
          Remove selected members
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { OrganizationMemberTableActions };
