import { Chat } from "@/components/chat/chat";
import { getChatById, getMessagesByChatId } from "@/db/queries/ai-queries";
import { getSession } from "@/db/queries/auth";
import { convertToUIMessages } from "@/lib/ai/utils";
import { langfuseServer } from "@/lib/langfuse/langfuse-server";
import { notFound } from "next/navigation";

const SingleChatPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await getSession();

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const scores = await langfuseServer.api.scoreGet({
    scoreIds: messagesFromDb
      .map((message) => {
        if (message.role !== "user") {
          return message.id;
        }
      })
      .join(","),
  });

  return (
    <div className="-m-6 h-[calc(100dvh-56px)]">
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        scores={scores.data}
      />
    </div>
  );
};

export default SingleChatPage;
