import { NavUser } from "@/components/account/nav-user";
import { CourseSwitcherServer } from "@/components/courses/course-switcher/course-switcher-server";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { sidebarInstructorMenu, sidebarStudentMenu } from "@/settings/menus";
import Link from "next/link";
import { Suspense } from "react";

const AppSidebar = async () => {
  return (
    <Sidebar id="tour1-step1">
      <SidebarHeader>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <CourseSwitcherServer />
        </Suspense>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Study</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarStudentMenu.map((item) => (
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
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
