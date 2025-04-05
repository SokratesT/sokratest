import "server-only";

import { db } from "@/db/drizzle";
import { courseInvitation } from "@/db/schema/course-invitation";
import { desc, eq } from "drizzle-orm";
import { withAuthQuery } from "./utils/with-auth-query";

export const getUserCourseInvitations = async () => {
  return withAuthQuery(async (session) => {
    const query = await db
      .select()
      .from(courseInvitation)
      .where(eq(courseInvitation.email, session.user.email))
      .orderBy(desc(courseInvitation.createdAt));

    return { query };
  }, {});
};
