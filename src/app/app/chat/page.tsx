import { ChatsList } from "@/components/chat/chats-list";
import { NewChatButton } from "@/components/chat/new-chat-button";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";

const ChatsPage = async () => {
  const result = await getUserChatsForActiveCourse();

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

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

      <ChatsList chats={result.data.query} />
    </div>
  );
};

export default ChatsPage;
