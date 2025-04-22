import { NavUser } from "@/components/account/nav-user";
import { Logo } from "@/components/app/logo";
import { NewChatButton } from "@/components/chat/new-chat-button";
import { CourseSwitcherServer } from "@/components/courses/course-switcher/course-switcher-server";
import { SkeletonsArray } from "@/components/placeholders/skeletons-array";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { Suspense } from "react";
import { ChatSidebarMenu } from "./chat-sidebar-menu";
import { ManageSidebarGroup } from "./manage-sidebar-group";

const AppSidebar = async () => {
  return (
    <Sidebar id="tour-sidebar">
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
        <NewChatButton size="sm">New Chat</NewChatButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense
              fallback={<SkeletonsArray className="mt-2 max-h-8" count={6} />}
            >
              <ChatSidebarMenu />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarContent>
          <Suspense>
            <ManageSidebarGroup />
          </Suspense>
        </SidebarContent>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
