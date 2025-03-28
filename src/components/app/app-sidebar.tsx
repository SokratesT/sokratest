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
import { ROUTES } from "@/settings/routes";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const AppSidebar = async () => {
  return (
    <Sidebar id="tour1-step1">
      <SidebarHeader>
        <Link
          href={ROUTES.PRIVATE.root.getPath()}
          className="flex items-center lg:justify-center"
        >
          <Image
            src="/logo/text_color.svg"
            alt="SokratesT Logo"
            width={150}
            height={40}
            className="h-14 w-auto dark:hidden"
          />
          <Image
            src="/logo/text_white.svg"
            alt="SokratesT Logo"
            width={150}
            height={40}
            className="hidden h-14 w-auto dark:block"
          />
        </Link>
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
          <CourseSwitcherServer />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
