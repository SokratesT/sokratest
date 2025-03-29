import { Placeholder } from "@/components/ui/custom/placeholder";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

const ChatSidebarContent = async () => {
  const result = await getUserChatsForActiveCourse();

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const chats = result.data.query;

  return (
    <SidebarContent>
      <SidebarGroup>
        <Link
          href={ROUTES.PRIVATE.chat.add.getPath()}
          className={buttonVariants({ variant: "default" })}
        >
          New Chat
        </Link>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild>
                  <Link
                    href={ROUTES.PRIVATE.chat.view.getPath({ id: chat.id })}
                  >
                    <span>{chat.title}</span>
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

export { ChatSidebarContent };
