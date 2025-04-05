import "server-only";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { desc, eq } from "drizzle-orm";
import { withAuthQuery } from "./utils/with-auth-query";

// TODO: Improve queries

export const getUserChatsForActiveCourse = async () => {
  return withAuthQuery(
    async (session) => {
      const query = await db
        .select()
        .from(chat)
        .where(eq(chat.courseId, session.session.activeCourseId))
        .orderBy(desc(chat.createdAt));

      return { query };
    },
    { requireCourse: true },
  );
};
