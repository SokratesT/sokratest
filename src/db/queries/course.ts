import "server-only";

import { db } from "@/db/drizzle";
import { type Course, course, courseMember } from "@/db/schema/course";
import type { Session as AuthSession } from "better-auth";
import { and, count, eq, getTableColumns } from "drizzle-orm";
import { buildPagination, buildSortOrder } from "./utils/query-builders";
import { withAuthQuery } from "./utils/with-auth-query";

const VALID_COURSE_SORT_COLUMNS = ["title", "createdAt"] as (keyof Course)[];

export const getUserCoursesOnLogin = (session: AuthSession) => {
  if (!session) {
    throw new Error("Not authenticated");
  }

  return db
    .select({ id: courseMember.courseId })
    .from(courseMember)
    .where(eq(courseMember.userId, session.userId));
};

export const getUserCoursesForActiveOrganization = async (options: {
  sort: { id: string; desc: boolean }[];
  pageIndex: number;
  pageSize: number;
}) => {
  return withAuthQuery(
    async (session) => {
      const { sort, pageIndex, pageSize } = options;
      const { limit, offset } = buildPagination({ pageIndex, pageSize });

      const sortOrder = buildSortOrder(
        sort,
        course,
        VALID_COURSE_SORT_COLUMNS,
        "createdAt",
      );

      if (!session.session.activeOrganizationId)
        return { query: [], rowCount: { count: 0 } };

      const query = await db
        .select({ ...getTableColumns(course) })
        .from(course)
        .innerJoin(
          courseMember,
          and(
            eq(course.id, courseMember.courseId),
            eq(courseMember.userId, session.session.userId),
          ),
        )
        .where(eq(course.organizationId, session.session.activeOrganizationId))
        .limit(limit)
        .offset(offset)
        .orderBy(...sortOrder);

      const [rowCount] = await db
        .select({ count: count() })
        .from(course)
        .innerJoin(
          courseMember,
          and(
            eq(course.id, courseMember.courseId),
            eq(courseMember.userId, session.session.userId),
          ),
        )
        .where(eq(course.organizationId, session.session.activeOrganizationId));

      return { query, rowCount };
    },
    { requireOrg: true },
  );
};

export const getCourseById = async (id: Course["id"]) => {
  return withAuthQuery(
    async () => {
      const [query] = await db
        .select({ ...getTableColumns(course) })
        .from(course)
        .where(eq(course.id, id))
        .limit(1);

      return { query };
    },
    {
      access: {
        resource: { context: "course", type: "course", id },
        action: "read",
      },
    },
  );
};
