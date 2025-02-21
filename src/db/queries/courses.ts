"server only";

import { db } from "@/db/drizzle";
import { type Course, courseMember, courses } from "@/db/schema/courses";
import { auth } from "@/lib/auth";
import type { Session as DefaultSession } from "better-auth";
import { asc, count, desc, eq, getTableColumns } from "drizzle-orm";
import { headers } from "next/headers";

export const getUserCoursesOnLogin = async (session: DefaultSession) => {
  if (!session) {
    throw new Error("Not authenticated");
  }

  return db
    .select({ id: courseMember.courseId })
    .from(courseMember)
    .where(eq(courseMember.userId, session.userId));
};

// TODO: Improve queries

function isValidColumnId(id: string): id is keyof Course {
  return ["title", "createdAt"].includes(id);
}

export const getUserActiveOrganizationCourses = async (options: {
  sort: { id: string; desc: boolean }[];
  pageIndex: number;
  pageSize: number;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  let query: Course[] = [];
  let rowCount: { count: number } = { count: 0 };

  const { sort, pageIndex, pageSize } = options;

  if (!session?.session.activeOrganizationId) {
    return {
      query: [],
      rowCount: { count: 0 },
      error: "No session or active organization",
    };
  }

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        const column = courses[s.id as keyof Course];
        return s.desc ? desc(column) : asc(column);
      }) ?? [asc(courses.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(courses) })
      .from(courses)
      .where(eq(courses.organizationId, session.session.activeOrganizationId))
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db.select({ count: count() }).from(courses);
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount, error: null };
};

export const getCourseById = async (id: Course["id"]) => {
  let query: Course | undefined = undefined;

  try {
    [query] = await db
      .select({ ...getTableColumns(courses) })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
  } catch (error) {
    console.error(error);
  }

  return { query, error: null };
};
