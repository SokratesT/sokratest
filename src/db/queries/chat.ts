import "server-only";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { and, desc, eq } from "drizzle-orm";
import { withAuthQuery } from "./utils/with-auth-query";

export const getUserChatsForActiveCourse = async () => {
  return withAuthQuery(
    async (session) => {
      const query = await db
        .select()
        .from(chat)
        .where(
          and(
            eq(chat.courseId, session.session.activeCourseId),
            eq(chat.userId, session.user.id),
          ),
        )
        .orderBy(desc(chat.updatedAt));

      return { query };
    },
    { requireCourse: true },
  );
};
