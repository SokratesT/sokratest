import "server-only";
import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { type ChatMessage, chatMessage } from "@/db/schema/chat-message";
import { and, asc, eq, gte } from "drizzle-orm";

// TODO: Refactor to "update chat"
export async function saveChat({
  id,
  userId,
  courseId,
  title,
}: {
  id: string;
  userId: string;
  courseId: string;
  title: string;
}) {
  try {
    return await db
      .insert(chat)
      .values({
        id,
        createdAt: new Date(),
        userId,
        courseId,
        title,
      })
      .onConflictDoUpdate({ target: chat.id, set: { title } });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({
  messages,
}: { messages: Array<ChatMessage> }) {
  try {
    await db.insert(chatMessage).values(messages).onConflictDoUpdate({
      target: chatMessage.id,
      set: chatMessage,
    });

    await db
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, messages[0].chatId));
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.chatId, id))
      .orderBy(asc(chatMessage.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(chatMessage).where(eq(chatMessage.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(chatMessage)
      .where(
        and(
          eq(chatMessage.chatId, chatId),
          gte(chatMessage.createdAt, timestamp),
        ),
      );
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database",
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}
