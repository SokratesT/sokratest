import type { SearchParams } from "nuqs/server";
import { ChatsList } from "@/components/chat/chats-list";
import { NewChatButton } from "@/components/chat/new-chat-button";
import { SearchInput } from "@/components/documents/search-input";
import { Placeholder } from "@/components/placeholders/placeholder";
import { getUserChatsForActiveCourse } from "@/db/queries/chat";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";

const ChatsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { search } = await querySearchParamsCache.parse(searchParams);

  const result = await getUserChatsForActiveCourse({ search });

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
          <SearchInput placeholder="Search chats..." />
          <NewChatButton size="sm">New Chat</NewChatButton>
        </div>
      </div>

      <ChatsList chats={result.data.query} />
    </div>
  );
};

export default ChatsPage;
