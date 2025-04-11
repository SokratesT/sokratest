import { Chat } from "@/components/chat/chat";
import { Placeholder } from "@/components/placeholders/placeholder";
import { getMessagesByChatId } from "@/db/queries/ai-queries";
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

  return (
    <div className="-m-2 sm:-m-6 h-[calc(100dvh-56px)]">
      <Chat
        id={id}
        initialMessages={convertToUIMessages(messages)}
        scores={scores.data}
      />
    </div>
  );
};

export default SingleChatPage;
