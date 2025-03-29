import { Placeholder } from "@/components/ui/custom/placeholder";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";

const ChatSidebarMenu = async () => {
  const result = await getUserChatsForActiveCourse();

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const chats = result.data.query;

  return (
    <SidebarMenu>
      {chats.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton asChild>
            <Link href={ROUTES.PRIVATE.chat.view.getPath({ id: chat.id })}>
              <span>{chat.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export { ChatSidebarMenu };
