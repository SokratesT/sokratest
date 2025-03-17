"server only";

import { db } from "@/db/drizzle";
import { type Course, course, courseMember } from "@/db/schema/course";
import type { Session as AuthSession } from "better-auth";
import { count, eq, getTableColumns } from "drizzle-orm";
import { withAuthQuery } from "./common";
import { buildPagination, buildSortOrder } from "./query-builders";
import { hasPermission } from "@/settings/rbac";

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
  return withAuthQuery(async (session) => {
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
      .selectDistinct({ ...getTableColumns(course) })
      .from(course)
      .innerJoin(courseMember, eq(courseMember.userId, session.session.userId))
      .where(eq(course.organizationId, session.session.activeOrganizationId))
      .limit(limit)
      .offset(offset)
      .orderBy(...sortOrder);

    const [rowCount] = await db
      .select({ count: count() })
      .from(course)
      .innerJoin(courseMember, eq(courseMember.userId, session.session.userId))
      .where(eq(course.organizationId, session.session.activeOrganizationId));

    return { query, rowCount };
  }, {});
};

export const getCourseById = async (id: Course["id"]) => {
  return withAuthQuery(
    async () => {
      if (await hasPermission({ type: "course", id }, "read")) {
        return { query: null };
      }

      const [query] = await db
        .select({ ...getTableColumns(course) })
        .from(course)
        .where(eq(course.id, id))
        .limit(1);

      return { query };
    },
    {
      resource: { type: "course", id },
    },
  );
};

/* export const getActiveCourse = async () => {
  return withAuthQuery(
    async (session) => {
      const [query] = await db
        .select({ ...getTableColumns(course) })
        .from(course)
        .where(eq(course.id, session.session.activeCourseId))
        .limit(1);

      return { query };
    },
    {
      requireCourse: true,
    },
  );
}; */
