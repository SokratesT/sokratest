import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSession } from "@/db/queries/auth";
import { hasPermission } from "@/lib/rbac";
import { sidebarInstructorMenu } from "@/settings/menus";
import Link from "next/link";

const ManageSidebarGroup = async () => {
  // TODO: Check for user roles here

  const session = await getSession();

  if (
    !session ||
    !session.session.activeCourseId ||
    !session.session.activeOrganizationId
  ) {
    return null;
  }

  const hasCourseEditPermission = await hasPermission(
    { context: "course", id: session.session.activeCourseId, type: "course" },
    "write",
  );

  /* const hasOrganizationEditPermission = hasPermission(
    {
      context: "organization",
      id: session.session.activeOrganizationId,
      type: "organization",
    },
    "write",
  ); */

  if (!hasCourseEditPermission) {
    return null;
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Manage</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {sidebarInstructorMenu.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export { ManageSidebarGroup };
