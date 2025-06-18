import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { ROUTES } from "@/settings/routes";
import { ChatsList } from "./chats-list";
import { NewChatButton } from "./new-chat-button";

const ChatsPreview = async () => {
  const result = await getUserChatsForActiveCourse({ limit: 6 });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const chats = result.data.query;

  return (
    <div className="col-span-3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="tour-history" className="font-semibold text-2xl tracking-tight">
          Your Recent Conversations
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.PRIVATE.chat.root.getPath()}
            className={buttonVariants({ variant: "outline" })}
          >
            Show all
          </Link>
          <NewChatButton id="tour-newChat" size="icon" variant="outline">
            <PlusIcon />
          </NewChatButton>
        </div>
      </div>
      <ChatsList chats={chats} />
    </div>
  );
};

export { ChatsPreview };
