import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { Placeholder } from "../ui/custom/placeholder";
import { ChatsList } from "./chats-list";

const ChatsPreview = async () => {
  const result = await getUserChatsForActiveCourse();

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div className="col-span-3 space-y-4">
      <h2 className="font-semibold text-2xl tracking-tight">
        Your Recent Conversations
      </h2>
      <ChatsList chats={result.data.query} />
    </div>
  );
};

export { ChatsPreview };
