"server only";

import { db } from "@/db/drizzle";
import { type Organization, member, organization } from "@/db/schema/auth";
import type { Session } from "better-auth";
import { count, eq, getTableColumns, ilike } from "drizzle-orm";
import { buildPagination, buildSortOrder } from "./utils/query-builders";
import { withAuthQuery } from "./utils/with-auth-query";

export const getUserOrganizationsOnLogin = async (session: Session) => {
  if (!session) {
    throw new Error("Not authenticated");
  }

  return db
    .select({ id: member.organizationId })
    .from(member)
    .where(eq(member.userId, session.userId));
};

const VALID_ORGANIZATION_SORT_COLUMNS = [
  "name",
  "slug",
] as (keyof Organization)[];

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
      requireOrg: true,
      access: {
        resource: { context: "organization", type: "organization", id },
        action: "read",
      },
    },
  );
};
