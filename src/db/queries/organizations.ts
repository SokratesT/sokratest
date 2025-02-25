"server only";

import { db } from "@/db/drizzle";
import { type Organization, member, organization } from "@/db/schema/auth";
import type { Session } from "better-auth";
import { asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { withAuthQuery } from "./common";
import { buildPagination, buildSortOrder } from "./query-builders";

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

const VALID_ORGANIZATION_SORT_COLUMNS = [
  "name",
  "slug",
] as (keyof Organization)[];

export const getAvailableOrganizations2 = async (
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

export const getAvailableOrganizations = async (options: {
  sort: { id: string; desc: boolean }[];
  pageIndex: number;
  pageSize: number;
  search: string;
}) => {
  return withAuthQuery(async (session) => {
    const { sort, pageIndex, pageSize } = options;
    const { limit, offset } = buildPagination({ pageIndex, pageSize });

    const sortOrder = buildSortOrder(
      sort,
      organization,
      VALID_ORGANIZATION_SORT_COLUMNS,
      "createdAt",
    );

    const query = await db
      .selectDistinct({ ...getTableColumns(organization) })
      .from(organization)
      .innerJoin(member, eq(member.userId, session.session.userId))
      .where(ilike(organization.name, `%${options.search}%`))
      .limit(limit)
      .offset(offset)
      .orderBy(...sortOrder);

    const [rowCount] = await db
      .select({ count: count() })
      .from(organization)
      .innerJoin(member, eq(member.userId, session.session.userId))
      .where(ilike(organization.name, `%${options.search}%`));

    return { query, rowCount };
  }, {});
};

export const getOrganizationById = async (id: Organization["id"]) => {
  return withAuthQuery(
    async () => {
      const [query] = await db
        .select({ ...getTableColumns(organization) })
        .from(organization)
        .where(eq(organization.id, id))
        .limit(1);

      return { query };
    },
    {
      resource: { type: "organization", id },
    },
  );
};
