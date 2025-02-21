"server only";

import { db } from "@/db/drizzle";
import { type User, member, user } from "@/db/schema/auth";
import { type Course, courseMember } from "@/db/schema/courses";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
  not,
  or,
} from "drizzle-orm";

// TODO: Centralise this in a shared file

// Type guard function
function isValidColumnId(id: string): id is keyof User {
  return ["name", "email", "role"].includes(id);
}

export const getAvailableUsers = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  let query: User[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (["name", "email", "role"].includes(s.id)) {
          const column = user[s.id as keyof User];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(user.createdAt);
        }
      }) ?? [asc(user.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .where(ilike(user.email, `%${search}%`))
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(user)
      .where(ilike(user.email, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};

export const getCourseUsers = async (
  courseId: Course["id"],
  options: {
    sort: { id: string; desc: boolean }[];
    pageIndex: number;
    pageSize: number;
    // search?: string;
  },
) => {
  const { sort, pageIndex, pageSize } = options;

  let query: User[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (["name", "email", "role"].includes(s.id)) {
          const column = user[s.id as keyof User];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(user.createdAt);
        }
      }) ?? [asc(user.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .innerJoin(courseMember, eq(user.id, courseMember.userId))
      .where(eq(courseMember.courseId, courseId))
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(user)
      .innerJoin(courseMember, eq(user.id, courseMember.userId))
      .where(eq(courseMember.courseId, courseId));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};

export const getOrganizationUsersNotInCourse = async (
  search: string,
  organizationId: string,
  courseId: string,
) => {
  let query: User[] = [];

  try {
    query = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .leftJoin(courseMember, eq(user.id, courseMember.userId))
      .innerJoin(member, eq(user.id, member.userId))
      .where(
        and(
          ilike(user.email, `%${search}%`),
          eq(member.organizationId, organizationId),
          or(
            isNull(courseMember.courseId),
            not(eq(courseMember.courseId, courseId)),
          ),
        ),
      )
      .limit(10)
      .orderBy(asc(user.email));
  } catch (error) {
    console.error(error);
  }

  return { query };
};
