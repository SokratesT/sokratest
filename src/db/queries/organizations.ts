import "server-only";

import type { Session } from "better-auth";
import { count, eq, getTableColumns, ilike } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { member, type Organization, organization } from "@/db/schema/auth";
import type { Action } from "@/lib/rbac";
import {
  buildPagination,
  buildSortOrder,
  type PaginatedQueryOptions,
} from "./utils/query-builders";
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

export const getAvailableOrganizations = async (
  options: PaginatedQueryOptions,
) => {
  return withAuthQuery(async (session) => {
    const { sort, pageIndex, pageSize, search } = options;
    const { limit, offset } = buildPagination({ pageIndex, pageSize });

    const sortOrder = buildSortOrder(
      sort,
      organization,
      VALID_ORGANIZATION_SORT_COLUMNS,
      "createdAt",
    );

    // Build where clause conditionally
    const whereClause = search
      ? ilike(organization.name, `%${search}%`)
      : undefined;

    const [query, [rowCount]] = await Promise.all([
      db
        .selectDistinct({ ...getTableColumns(organization) })
        .from(organization)
        .innerJoin(member, eq(member.userId, session.session.userId))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(...sortOrder),
      db
        .select({ count: count() })
        .from(organization)
        .innerJoin(member, eq(member.userId, session.session.userId))
        .where(whereClause),
    ]);

    return { query, rowCount };
  }, {});
};

export const getOrganizationById = async (
  id: Organization["id"],
  action?: Action,
) => {
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
        action: action ?? "read",
      },
    },
  );
};
