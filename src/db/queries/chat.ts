import "server-only";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { and, desc, eq } from "drizzle-orm";
import { withAuthQuery } from "./utils/with-auth-query";

export const getUserChatsForActiveCourse = async (
  { limit }: { limit?: number } = { limit: undefined },
) => {
  return withAuthQuery(
    async (session) => {
      const baseQuery = db
        .select()
        .from(chat)
        .where(
          and(
            eq(chat.courseId, session.session.activeCourseId),
            eq(chat.userId, session.user.id),
          ),
        )
        .orderBy(desc(chat.updatedAt));

      const result = await (limit !== undefined
        ? baseQuery.limit(limit)
        : baseQuery);

      return { query: result };
    },
    { requireCourse: true },
  );
};
