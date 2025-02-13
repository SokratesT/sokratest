"use server";

import { db } from "@/db/drizzle";
import { chats } from "@/db/schema/chat";
import { messagesDb } from "@/db/schema/messages";
import { auth } from "@/lib/auth";
import { routes } from "@/settings/routes";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export const createNewChat = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const chatId = uuidv4();
  await db.insert(chats).values({
    id: chatId,
    title: "New Chat",
    userId: session?.user.id,
  });

  return chatId;
};

export const deleteLastMessage = async (chatId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const mostRecent = await db
    .select()
    .from(messagesDb)
    .where(eq(messagesDb.chatId, chatId))
    .orderBy(desc(messagesDb.createdAt))
    .limit(1);

  if (mostRecent.length > 0) {
    await db.delete(messagesDb).where(eq(messagesDb.id, mostRecent[0].id));
  }
};

export const deleteChat = async (chatId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.delete(chats).where(eq(chats.id, chatId));

  revalidatePath(routes.app.sub.chat.path);
};
