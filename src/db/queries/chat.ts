import "server-only";

import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { withAuthQuery } from "./utils/with-auth-query";

export const getUserChatsForActiveCourse = async ({
  limit,
  search,
}: {
  limit?: number;
  search?: string;
} = {}) => {
  return withAuthQuery(
    async (session) => {
      // Build conditions array dynamically
      const conditions = [
        eq(chat.courseId, session.session.activeCourseId),
        eq(chat.userId, session.user.id),
      ];

      if (search) {
        conditions.push(ilike(chat.title, `%${search}%`));
      }

      const baseQuery = db
        .select()
        .from(chat)
        .where(and(...conditions))
        .orderBy(desc(chat.updatedAt));

      const result = await (limit !== undefined
        ? baseQuery.limit(limit)
        : baseQuery);

      return { query: result };
    },
    { requireCourse: true },
  );
};
