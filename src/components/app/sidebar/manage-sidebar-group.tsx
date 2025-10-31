import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSession } from "@/db/queries/auth";
import { hasPermission } from "@/lib/rbac";
import {
  sidebarInstructorMenu,
  sidebarOrganizationAdminMenu,
} from "@/settings/menus";

const ManageSidebarGroup = async () => {
  const session = await getSession();

  const hasCourseEditPermission = await hasPermission(
    { context: "course", id: session?.session.activeCourseId, type: "course" },
    "update",
  );

  const hasOrganizationEditPermission = await hasPermission(
    {
      context: "organization",
      id: session?.session.activeOrganizationId,
      type: "organization",
    },
    "update",
  );

  if (
    !hasCourseEditPermission &&
    !hasOrganizationEditPermission &&
    session?.user.role !== "admin"
  ) {
    return null;
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {hasCourseEditPermission &&
            sidebarInstructorMenu.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          {hasOrganizationEditPermission &&
            sidebarOrganizationAdminMenu.map((item) => (
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
  );
};

export { ManageSidebarGroup };
