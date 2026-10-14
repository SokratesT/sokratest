import { Chat } from "@/components/chat/chat";
import { Placeholder } from "@/components/placeholders/placeholder";
import { getMessagesByChatId } from "@/db/queries/ai-queries";
import { getUserPreferences } from "@/db/queries/users";
import { convertToUIMessages } from "@/lib/ai/utils";
import { langfuse } from "@/lib/langfuse/client";

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

  // Votes use the assistant message id as score id
  const scores = await langfuse.api.scores.getMany({
    scoreIds: messages
      .filter((message) => message.role !== "user")
      .map((message) => message.id)
      .join(","),
    name: "rate_helpfulness",
  });

  const preferencesResult = await getUserPreferences();

  const { preferences } = preferencesResult.success
    ? preferencesResult.data.query
    : { preferences: {} };

  return (
    <div className="-mx-2 -my-6 h-[calc(100dvh-56px)] sm:-mx-2">
      <Chat
        id={id}
        initialMessages={convertToUIMessages(messages)}
        scores={scores.data.filter((score) => score.dataType === "NUMERIC")}
        preferences={preferences}
      />
    </div>
  );
};

export default SingleChatPage;
