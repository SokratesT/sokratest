"server only";

import { asc } from "drizzle-orm";
import { db } from "../drizzle";
import { type Chat, chats } from "../schema/chat";

// TODO: Improve queries

export const getAllChats = async () => {
  let query: Chat[] = [];

  try {
    query = await db.select().from(chats).orderBy(asc(chats.createdAt));
  } catch (error) {
    console.error(error);
  }

  return query;
};
