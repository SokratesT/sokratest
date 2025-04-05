import "server-only";

import { db } from "@/db/drizzle";
import { desc, eq } from "drizzle-orm";
import { courseInvitation } from "../schema/course-invitation";
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
