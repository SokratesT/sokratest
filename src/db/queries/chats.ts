"server only";

import { db } from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type Chat, chats } from "../schema/chat";

// TODO: Improve queries

export const getAllChats = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeCourseId) {
    throw new Error("No session or active organization");
  }

  let query: Chat[] = [];

  try {
    query = await db
      .select()
      .from(chats)
      .where(eq(chats.courseId, session.session.activeCourseId))
      .orderBy(asc(chats.createdAt));
  } catch (error) {
    console.error(error);
  }

  return query;
};
