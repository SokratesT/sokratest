import "server-only";

import { db } from "@/db/drizzle";
import {
  type CourseInvitation,
  courseInvitation,
} from "@/db/schema/course-invitation";
import { eq, getTableColumns } from "drizzle-orm";

export const getCourseInvitationById = async (
  id: string,
): Promise<{ query: CourseInvitation | undefined }> => {
  try {
    const [query] = await db
      .select({ ...getTableColumns(courseInvitation) })
      .from(courseInvitation)
      .where(eq(courseInvitation.id, id))
      .limit(1);

    return { query };
  } catch (error) {
    console.error("Error parsing UUID:", error);
    return { query: undefined };
  }
};
