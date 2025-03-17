import { getUserChatsForActiveCourse } from "@/db/queries/chats";
import { ChatsList } from "./chats-list";

const ChatsPreview = async () => {
  const { query } = await getUserChatsForActiveCourse();

  return (
    <div className="col-span-3 space-y-4">
      <h2 className="font-semibold text-2xl tracking-tight">
        Your Recent Conversations
      </h2>
      <ChatsList chats={query} />
    </div>
  );
};

export { ChatsPreview };
