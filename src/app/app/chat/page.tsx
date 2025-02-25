import { ChatsList } from "@/components/app/chats-list";
import { getUserChatsForActiveCourse } from "@/db/queries/chats";
import { NewChatButton } from "./_components/new-chat-button";

const ChatsPage = async () => {
  const query = await getUserChatsForActiveCourse();

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Chats
        </h4>
        <div className="flex gap-2">
          <NewChatButton>New Chat</NewChatButton>
        </div>
      </div>

      <ChatsList chats={query} />
    </div>
  );
};

export default ChatsPage;
