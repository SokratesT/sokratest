"server only";

import { db } from "@/db/drizzle";
import { type Organization, member, organization } from "@/db/schema/auth";
import type { Session } from "better-auth";
import { asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";

export const getUserOrganizationsOnLogin = async (session: Session) => {
  if (!session) {
    throw new Error("Not authenticated");
  }

  return db
    .select({ id: member.organizationId })
    .from(member)
    .where(eq(member.userId, session.userId));
};

function isValidColumnId(id: string): id is keyof Organization {
  return ["name", "slug"].includes(id);
}

export const getAvailableOrganizations = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  let query: Organization[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (["name", "email", "role"].includes(s.id)) {
          const column = organization[s.id as keyof Organization];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(organization.createdAt);
        }
      }) ?? [asc(organization.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(organization) })
      .from(organization)
      .where(ilike(organization.name, `%${search}%`))
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(organization)
      .where(ilike(organization.name, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};
