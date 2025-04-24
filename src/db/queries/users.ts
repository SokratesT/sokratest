import "server-only";

import { db } from "@/db/drizzle";
import { type User, member, user } from "@/db/schema/auth";
import { courseMember } from "@/db/schema/course";
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
import { cache } from "react";
import { withAuthQuery } from "./utils/with-auth-query";

// TODO: Centralise this in a shared file

// Type guard function
function isValidColumnId(id: string): id is keyof User {
  return ["name", "email", "role"].includes(id);
}

export const getActiveCourseUsers = async (
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
            const column = user[s.id as keyof User];
            return s.desc ? desc(column) : asc(column);
          } else {
            return asc(user.createdAt);
          }
        }) ?? [asc(user.createdAt)]; // Fallback default sort

      const query = await db
        .select({ ...getTableColumns(user) })
        .from(user)
        .innerJoin(courseMember, eq(user.id, courseMember.userId))
        .where(
          and(
            eq(courseMember.courseId, session.session.activeCourseId),
            ilike(user.email, `%${search}%`),
          ),
        )
        .limit(pageSize)
        .orderBy(...sortOrder)
        .offset(pageIndex * pageSize);

      const [rowCount] = await db
        .select({ count: count() })
        .from(user)
        .innerJoin(courseMember, eq(user.id, courseMember.userId))
        .where(
          and(
            eq(courseMember.courseId, session.session.activeCourseId),
            ilike(user.email, `%${search}%`),
          ),
        );

      return { query, rowCount };
    },
    { requireCourse: true },
  );
};

export const getCourseUsers = async ({
  sort,
  pageIndex,
  pageSize,
}: {
  sort: { id: string; desc: boolean }[];
  pageIndex: number;
  pageSize: number;
  // search?: string;
}) => {
  return withAuthQuery(
    async (session) => {
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

      const query = await db
        .select({ ...getTableColumns(user) })
        .from(user)
        .innerJoin(courseMember, eq(user.id, courseMember.userId))
        .where(eq(courseMember.courseId, session.session.activeCourseId))
        .limit(pageSize)
        .orderBy(...sortOrder)
        .offset(pageIndex * pageSize);

      const [rowCount] = await db
        .select({ count: count() })
        .from(user)
        .innerJoin(courseMember, eq(user.id, courseMember.userId))
        .where(eq(courseMember.courseId, session.session.activeCourseId));

      return { query, rowCount };
    },
    {
      requireCourse: true,
      access: {
        resource: { context: "organization", type: "user", id: "all" },
        action: "read",
      },
    },
  );
};

export const getOrganizationUsers = async ({
  sort,
  pageIndex,
  pageSize,
}: {
  sort: { id: string; desc: boolean }[];
  pageIndex: number;
  pageSize: number;
}) => {
  return withAuthQuery(
    async (session) => {
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

      const query = await db
        .select({ ...getTableColumns(user) })
        .from(user)
        .innerJoin(member, eq(user.id, member.userId))
        .where(eq(member.organizationId, session.session.activeOrganizationId))
        .limit(pageSize)
        .orderBy(...sortOrder)
        .offset(pageIndex * pageSize);

      const [rowCount] = await db
        .select({ count: count() })
        .from(user)
        .innerJoin(member, eq(user.id, member.userId))
        .where(eq(member.organizationId, session.session.activeOrganizationId));

      return { query, rowCount };
    },
    { requireOrg: true },
  );
};

export const getOrganizationUsersNotInCourse = async (search: string) => {
  return withAuthQuery(
    async (session) => {
      const query = await db
        .select({ ...getTableColumns(user) })
        .from(user)
        .leftJoin(courseMember, eq(user.id, courseMember.userId))
        .innerJoin(member, eq(user.id, member.userId))
        .where(
          and(
            ilike(user.email, `%${search}%`),
            eq(member.organizationId, session.session.activeOrganizationId),
            or(
              isNull(courseMember.courseId),
              not(eq(courseMember.courseId, session.session.activeCourseId)),
            ),
          ),
        )
        .limit(10)
        .orderBy(asc(user.email));

      return { query };
    },
    { requireCourse: true, requireOrg: true },
  );
};

export const getUserById = async (id: User["id"]) => {
  return withAuthQuery(
    async () => {
      const [query] = await db
        .select({ ...getTableColumns(user) })
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      return { query };
    },
    {
      access: {
        resource: { context: "organization", type: "user", id },
        action: "read",
      },
    },
  );
};

export const getUserCourseMembershipById = async (id: User["id"]) => {
  return withAuthQuery(
    async (session) => {
      const [query] = await db
        .select({ ...getTableColumns(courseMember) })
        .from(courseMember)
        .where(
          and(
            eq(courseMember.userId, id),
            eq(courseMember.courseId, session.session.activeCourseId),
          ),
        )
        .limit(1);

      return { query };
    },
    {
      requireCourse: true,
      access: {
        resource: { context: "organization", type: "user", id },
        action: "read",
      },
    },
  );
};

export const getUserOrganizationMembershipById = async (id: User["id"]) => {
  return withAuthQuery(
    async (session) => {
      const [query] = await db
        .select({ ...getTableColumns(member) })
        .from(member)
        .where(
          and(
            eq(member.userId, id),
            eq(member.organizationId, session.session.activeOrganizationId),
          ),
        )
        .limit(1);

      return { query };
    },
    {
      requireOrg: true,
      access: {
        resource: { context: "organization", type: "user", id },
        action: "read",
      },
    },
  );
};

export const getUserPreferences = cache(async () => {
  return withAuthQuery(async (session) => {
    const [query] = await db
      .select({ preferences: user.preferences })
      .from(user)
      .where(eq(user.id, session.session.userId))
      .limit(1);

    return { query };
  }, {});
});
