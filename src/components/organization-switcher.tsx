"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { Building2Icon, Check, ChevronsUpDown } from "lucide-react";
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
        router.push(routes.app.path);
        toast.success(`Organization changed to ${organization?.name}`);
      })
      .catch((error) => {
        toast.error(`Failed to change organization: ${error.message}`);
      });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Organisation</span>
                {isPending || !activeOrganization ? (
                  <Skeleton className="h-3.5" />
                ) : (
                  <span>{activeOrganization?.name}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {organizations?.map((organization) => (
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { OrganizationSwitcher };
