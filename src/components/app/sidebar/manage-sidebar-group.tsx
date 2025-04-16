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
import { sidebarInstructorMenu } from "@/settings/menus";
import Link from "next/link";

const ManageSidebarGroup = async () => {
  // TODO: Check for user roles here

  const session = await getSession();

  const hasCourseEditPermission = await hasPermission(
    { context: "course", id: session?.session.activeCourseId, type: "course" },
    "update",
  );

  if (!hasCourseEditPermission && session?.user.role !== "admin") {
    return null;
  }

  return (
    <SidebarGroup className="p-0">
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
  );
};

export { ManageSidebarGroup };
