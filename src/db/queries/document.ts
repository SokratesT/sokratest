import "server-only";

import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { type Document, document } from "@/db/schema/document";
import type { PaginatedQueryOptions } from "./utils/query-builders";
import { withAuthQuery } from "./utils/with-auth-query";

function isValidColumnId(id: Document["id"]): id is keyof Document {
  return ["title", "createdAt", "size", "embeddingStatus"].includes(id);
}

export const getActiveCourseDocuments = async ({
  sort,
  pageIndex,
  pageSize,
  search,
}: PaginatedQueryOptions) => {
  return withAuthQuery(
    async (session) => {
      const sortOrder = sort
        ?.filter((s) => isValidColumnId(s.id))
        .map((s) => {
          if (
            ["title", "createdAt", "size", "embeddingStatus"].includes(s.id)
          ) {
            const column = document[s.id as keyof Document];
            return s.desc ? desc(column) : asc(column);
          }
          return asc(document.createdAt);
        }) ?? [asc(document.createdAt)]; // Fallback default sort

      // Build conditions array dynamically
      const conditions = [
        eq(document.courseId, session.session.activeCourseId),
      ];
      if (search) {
        conditions.push(ilike(document.title, `%${search}%`));
      }
      const whereClause = and(...conditions);

      const [query, [rowCount]] = await Promise.all([
        db
          .select({ ...getTableColumns(document) })
          .from(document)
          .where(whereClause)
          .limit(pageSize)
          .orderBy(...sortOrder)
          .offset(pageIndex * pageSize),
        db.select({ count: count() }).from(document).where(whereClause),
      ]);

      return { query, rowCount };
    },
    {
      requireCourse: true,
      access: {
        resource: { context: "course", type: "document", id: "all" },
        action: "read",
      },
    },
  );
};

export const getDocumentById = async (id: Document["id"]) => {
  return withAuthQuery(
    async () => {
      const [query] = await db
        .select({ ...getTableColumns(document) })
        .from(document)
        .where(eq(document.id, id))
        .limit(1);

      return { query };
    },
    {
      access: {
        resource: { context: "course", type: "document", id },
        action: "read",
      },
    },
  );
};
