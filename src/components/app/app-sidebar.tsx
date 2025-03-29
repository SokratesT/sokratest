import { NavUser } from "@/components/account/nav-user";
import { CourseSwitcherServer } from "@/components/courses/course-switcher/course-switcher-server";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { Suspense } from "react";
import { ChatSidebarContent } from "./chat-sidebar-content";
import { Logo } from "./logo";
import { ManageSidebarContent } from "./manage-sidebar-content";

const AppSidebar = async () => {
  return (
    <Sidebar id="tour1-step1">
      <SidebarHeader>
        <Link
          href={ROUTES.PRIVATE.root.getPath()}
          className="flex items-center lg:justify-center"
        >
          <Logo />
        </Link>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <CourseSwitcherServer />
        </Suspense>
      </SidebarHeader>

      <ChatSidebarContent />

      <SidebarFooter>
        <ManageSidebarContent />
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
