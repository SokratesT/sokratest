import { Chat } from "@/components/chat/chat";
import { Placeholder } from "@/components/placeholders/placeholder";
import { getMessagesByChatId } from "@/db/queries/ai-queries";
import { getUserPreferences } from "@/db/queries/users";
import { convertToUIMessages } from "@/lib/ai/utils";
import { langfuseServer } from "@/lib/langfuse/langfuse-server";

const SingleChatPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;

  const result = await getMessagesByChatId({
    id,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const messages = result.data.query;

  const scores = await langfuseServer.api.scoreGet({
    scoreIds: messages
      .map((message) => {
        if (message.role !== "user") {
          return message.id;
        }
      })
      .join(","),
  });

  const preferencesResult = await getUserPreferences();

  const { preferences } = preferencesResult.success
    ? preferencesResult.data.query
    : { preferences: {} };

  return (
    <div className="-my-6 -mx-2 sm:-mx-2 h-[calc(100dvh-56px)]">
      <Chat
        id={id}
        initialMessages={convertToUIMessages(messages)}
        scores={scores.data}
        preferences={preferences}
      />
    </div>
  );
};

export default SingleChatPage;
