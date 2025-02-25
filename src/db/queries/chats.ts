"server only";

import { db } from "@/db/drizzle";
import { desc, eq } from "drizzle-orm";
import { chats } from "../schema/chat";
import { withAuthQuery } from "./common";

// TODO: Improve queries

export const getUserChatsForActiveCourse = async () => {
  return withAuthQuery(
    async (session) => {
      const query = await db
        .select()
        .from(chats)
        .where(eq(chats.courseId, session.session.activeCourseId))
        .orderBy(desc(chats.createdAt));

      return query;
    },
    { requireCourse: true },
  );
};
