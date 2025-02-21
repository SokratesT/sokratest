"use client";

import { setActiveCourse } from "@/actions/course";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const OrganizationSwitcher = () => {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const router = useRouter();

  const handleOrganizationChange = async (
    organization: typeof authClient.$Infer.Organization,
  ) => {
    await authClient.organization
      .setActive({
        organizationId: organization.id,
      })
      .then(() => {
        setActiveCourse(null);
        router.push(routes.app.path);
        toast.success(`Organization changed to ${organization?.name}`);
      })
      .catch((error) => {
        toast.error(`Failed to change organization: ${error.message}`);
      });
  };

  if (isPending || !organizations) return <Skeleton className="h-12 w-full" />;

  return (
    <DropdownMenuGroup>
      {organizations.map((organization) => (
        <DropdownMenuItem
          key={organization.id}
          onSelect={() => handleOrganizationChange(organization)}
        >
          {organization.name}
          {activeOrganization?.id === organization.id && (
            <Check className="ml-auto" />
          )}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
};

export { OrganizationSwitcher };
