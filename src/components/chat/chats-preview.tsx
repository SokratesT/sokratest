import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { ChatsList } from "./chats-list";

const ChatsPreview = async () => {
  const result = await getUserChatsForActiveCourse({ limit: 6 });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div className="col-span-3 space-y-4">
      <h2 className="font-semibold text-2xl tracking-tight">
        Your Recent Conversations
      </h2>
      <ChatsList chats={result.data.query} />
      <Link
        href={ROUTES.PRIVATE.chat.root.getPath()}
        className={buttonVariants({ variant: "outline" })}
      >
        Show all
      </Link>
    </div>
  );
};

export { ChatsPreview };
