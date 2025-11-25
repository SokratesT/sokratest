import "server-only";

import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { db } from "@/db/drizzle";
import type { Invitation } from "@/db/schema/auth";
import {
  type CourseInvitation,
  courseInvitation,
} from "@/db/schema/course-invitation";
import type { PaginatedQueryOptions } from "./utils/query-builders";
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

// Type guard function
function isValidColumnId(id: string): id is keyof Invitation {
  return ["expiresAt", "email", "role"].includes(id);
}

export const getCourseInvitations = async ({
  sort,
  pageIndex,
  pageSize,
  search,
}: PaginatedQueryOptions) => {
  return withAuthQuery(
    async (session) => {
      const sortOrder = sort
        ?.filter((s) => isValidColumnId(s.id))
        .map((s) => {
          if (["name", "email", "role"].includes(s.id)) {
            const column = courseInvitation[s.id as keyof CourseInvitation];
            return s.desc ? desc(column) : asc(column);
          }
          return asc(courseInvitation.expiresAt);
        }) ?? [asc(courseInvitation.expiresAt)]; // Fallback default sort

      // Build conditions array dynamically
      const conditions = [
        eq(courseInvitation.courseId, session.session.activeCourseId),
      ];
      if (search) {
        conditions.push(ilike(courseInvitation.email, `%${search}%`));
      }
      const whereClause = and(...conditions);

      const [query, [rowCount]] = await Promise.all([
        db
          .select({ ...getTableColumns(courseInvitation) })
          .from(courseInvitation)
          .where(whereClause)
          .limit(pageSize)
          .orderBy(...sortOrder)
          .offset(pageIndex * pageSize),
        db.select({ count: count() }).from(courseInvitation).where(whereClause),
      ]);

      return { query, rowCount };
    },
    {
      requireCourse: true,
      access: {
        resource: { context: "course", type: "invitation", id: "all" },
        action: "read",
      },
    },
  );
};
