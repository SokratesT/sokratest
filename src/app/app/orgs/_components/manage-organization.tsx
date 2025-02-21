"use client";

import { revalidatePathFromClient } from "@/actions/revalidate-helper";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { toast } from "sonner";

const ManageOrganization = ({
  organization,
}: { organization: Organization }) => {
  const handleDeleteOrganization = async (organizationId: string) => {
    const res = await authClient.organization.delete({ organizationId });

    if (res.error) {
      toast.error(`Failed to delete organisation: ${res.error.message}`);
    } else {
      toast.success("Organisation deleted");
      revalidatePathFromClient(routes.app.sub.organizations.path);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
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
