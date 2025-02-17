"server only";

import { auth } from "@/lib/auth";
import { asc, count, desc, eq, getTableColumns } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "../drizzle";
import { type Course, courses } from "../schema/courses";

// TODO: Improve queries

function isValidColumnId(id: string): id is keyof Course {
  return ["title", "createdAt"].includes(id);
}

export const getAvailableCourses = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
) => {
  let query: Course[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.session.activeOrganizationId) {
      throw new Error("No session or active organization");
    }

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

  return { query, rowCount };
};
