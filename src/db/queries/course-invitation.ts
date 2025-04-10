import "server-only";

import { db } from "@/db/drizzle";
import type { Invitation } from "@/db/schema/auth";
import {
  type CourseInvitation,
  courseInvitation,
} from "@/db/schema/course-invitation";
import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
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

// TODO: Centralise this in a shared file

// Type guard function
function isValidColumnId(id: string): id is keyof Invitation {
  return ["expiresAt", "email", "role"].includes(id);
}

export const getCourseInvitations = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  return withAuthQuery(
    async (session) => {
      const sortOrder = sort
        ?.filter((s) => isValidColumnId(s.id))
        .map((s) => {
          if (["name", "email", "role"].includes(s.id)) {
            const column = courseInvitation[s.id as keyof CourseInvitation];
            return s.desc ? desc(column) : asc(column);
          } else {
            return asc(courseInvitation.expiresAt);
          }
        }) ?? [asc(courseInvitation.expiresAt)]; // Fallback default sort

      const query = await db
        .select({ ...getTableColumns(courseInvitation) })
        .from(courseInvitation)
        .where(
          and(
            ilike(courseInvitation.email, `%${search}%`),
            eq(courseInvitation.courseId, session.session.activeCourseId),
          ),
        )
        .limit(pageSize)
        .orderBy(...sortOrder)
        .offset(pageIndex * pageSize);

      const [rowCount] = await db
        .select({ count: count() })
        .from(courseInvitation)
        .where(
          and(
            ilike(courseInvitation.email, `%${search}%`),
            eq(courseInvitation.courseId, session.session.activeCourseId),
          ),
        );

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
