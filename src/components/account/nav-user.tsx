import { SignOutButton } from "@/components/auth/signout-button";
import { OrganizationSwitcher } from "@/components/organizations/organization-switcher";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSession } from "@/db/queries/auth";
import { getOrganizationById } from "@/db/queries/organizations";
import type { Organization } from "@/db/schema/auth";
import { sidebarUserMenu } from "@/settings/menus";
import { ChevronsUpDown, LogOut } from "lucide-react";
import Link from "next/link";

const userInitial = (name: string) => name[0].toUpperCase();

const NavUser = async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  let activeOrganization: Organization | null = null;

  if (session.session.activeOrganizationId) {
    const result = await getOrganizationById(
      session.session.activeOrganizationId,
    );

    if (!result.success) {
      return <Placeholder>{result.error.message}</Placeholder>;
    }

    activeOrganization = result.data.query;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {userInitial(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {session.user.name}
                </span>
                {/* <span className="truncate text-xs">{data.user.email}</span> */}
                {activeOrganization && (
                  <span className="truncate text-xs">
                    {activeOrganization.name}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {userInitial(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session.user.name}
                  </span>
                  <span className="truncate text-xs">{session.user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {sidebarUserMenu.map((item) => (
                <DropdownMenuItem key={item.url} asChild>
                  <Link href={item.url}>
                    <item.icon />
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <OrganizationSwitcher />
            <DropdownMenuSeparator />
            <SignOutButton asChild>
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut />
                Sign Out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { NavUser };
