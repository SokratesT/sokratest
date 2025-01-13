import "../_components/new/styles/markdown.css"; // code, latex and custom markdown styling
import "../_components/new/styles/pdf.css";
import { Chat } from "../_components/chat";
import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/chat";
import { asc, eq } from "drizzle-orm";

const ChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const query = await db
    .select()
    .from(messages)
    .where(eq(messages.chat, id))
    .orderBy(asc(messages.createdAt));

  return <Chat chatHistory={query} chatId={id} />;
};

export default ChatPage;
