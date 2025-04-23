import "server-only";

import { db } from "@/db/drizzle";
import { type Document, document } from "@/db/schema/document";
import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { withAuthQuery } from "./utils/with-auth-query";

function isValidColumnId(id: Document["id"]): id is keyof Document {
  return ["title", "createdAt", "size", "embeddingStatus"].includes(id);
}

export const getActiveCourseDocuments = async (
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
          if (
            ["title", "createdAt", "size", "embeddingStatus"].includes(s.id)
          ) {
            const column = document[s.id as keyof Document];
            return s.desc ? desc(column) : asc(column);
          } else {
            return asc(document.createdAt);
          }
        }) ?? [asc(document.createdAt)]; // Fallback default sort

      const query = await db
        .select({ ...getTableColumns(document) })
        .from(document)
        .where(
          and(
            ilike(document.title, `%${search}%`),
            eq(document.courseId, session.session.activeCourseId),
          ),
        )
        .limit(pageSize)
        .orderBy(...sortOrder)
        .offset(pageIndex * pageSize);

      const [rowCount] = await db
        .select({ count: count() })
        .from(document)
        .where(
          and(
            ilike(document.title, `%${search}%`),
            eq(document.courseId, session.session.activeCourseId),
          ),
        );

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
