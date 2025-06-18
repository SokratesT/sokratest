"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revalidatePathFromClient } from "@/db/actions/revalidate-helper";
import type { Organization } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";
import { OrganizationForm } from "./organization-form";

const ManageOrganization = ({
  organization,
}: {
  organization: Organization;
}) => {
  const handleDeleteOrganization = async (organizationId: string) => {
    toast.promise(authClient.organization.delete({ organizationId }), {
      loading: "Deleting organisation...",
      success: "Organisation deleted",
      error: (error) => ({
        message: "Failed to delete organisation",
        description: error.message,
      }),
    });
    revalidatePathFromClient({
      path: ROUTES.PRIVATE.organizations.root.getPath(),
    });
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <OrganizationForm organization={organization} />
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={() => handleDeleteOrganization(organization.id)}
        >
          Delete Organisation
        </Button>
      </div>
    </div>
  );
};

export { ManageOrganization };
