import type { SearchParams } from "nuqs/server";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/search-input";
import { ChatsList } from "@/components/chat/chats-list";
import { NewChatButton } from "@/components/chat/new-chat-button";
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
      <PageHeader
        title="Chats"
        actions={
          <>
            <SearchInput placeholder="Search chats..." />
            <NewChatButton size="sm">New Chat</NewChatButton>
          </>
        }
      />

      <ChatsList chats={result.data.query} />
    </div>
  );
};

export default ChatsPage;
