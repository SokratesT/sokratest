import { ChatActionsDropdown } from "@/components/chat/chat-actions-dropdown";
import { SimplePlaceholder } from "@/components/placeholders/simple-placeholder";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { ROUTES } from "@/settings/routes";
import { MessagesSquareIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

const ChatSidebarMenu = async () => {
  const result = await getUserChatsForActiveCourse();

  if (!result.success) {
    return (
      <SimplePlaceholder variant="muted">
        {result.error.message}
      </SimplePlaceholder>
    );
  }

  const chats = result.data.query;

  if (!chats || chats.length === 0) {
    return (
      <SimplePlaceholder Icon={MessagesSquareIcon} variant="muted">
        Your chats will appear here
      </SimplePlaceholder>
    );
  }

  return (
    <SidebarMenu>
      {chats.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton asChild>
            <Link href={ROUTES.PRIVATE.chat.view.getPath({ id: chat.id })}>
              {chat.title}
            </Link>
          </SidebarMenuButton>
          <ChatActionsDropdown chatId={chat.id}>
            <SidebarMenuAction>
              <MoreHorizontalIcon />
            </SidebarMenuAction>
          </ChatActionsDropdown>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export { ChatSidebarMenu };
