"use server";

import { db } from "@/db/drizzle";
import { chats, messages } from "@/db/schema/chat";
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
    user: session?.user.id,
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
    .from(messages)
    .where(eq(messages.chat, chatId))
    .orderBy(desc(messages.createdAt))
    .limit(1);

  if (mostRecent.length > 0) {
    await db.delete(messages).where(eq(messages.id, mostRecent[0].id));
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
