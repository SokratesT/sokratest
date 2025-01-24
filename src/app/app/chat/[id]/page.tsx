import { Chat } from "@/app/app/chat/_components/Chat";
import { getChatById, getMessagesByChatId } from "@/db/queries/ai-queries";
import { DEFAULT_MODEL, models } from "@/lib/ai/models";
import { convertToUIMessages } from "@/lib/ai/utils";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
// import { DataStreamHandler } from "../_components/data-stream-handler";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.user) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  // TODO: Change to database lookup
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL.id;

  return (
    <div className="-m-4 h-[calc(100dvh-60px)]">
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
      />
    </div>
  );
}
