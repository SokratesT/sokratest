"use client";

import { revalidatePathFromClient } from "@/actions/revalidate-helper";
import { Button } from "@/components/ui/button";
import type { organization } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import type { InferSelectModel } from "drizzle-orm";
import { toast } from "sonner";

type Organization = InferSelectModel<typeof organization>;

const ManageOrganization = ({
  organization,
}: { organization: Organization }) => {
  const handleDeleteOrganization = async (organizationId: string) => {
    const res = await authClient.organization.delete({ organizationId });

    if (res.error) {
      toast.error(`Failed to delete user: ${res.error.message}`);
    } else {
      toast.success("User deleted");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={() => handleDeleteOrganization(organization.id)}
        >
          Delete User
        </Button>
      </div>
    </div>
  );
};

export { ManageOrganization };
