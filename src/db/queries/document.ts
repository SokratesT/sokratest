import "server-only";

import { db } from "@/db/drizzle";
import { type Document, document } from "@/db/schema/document";
import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { getSession } from "./auth";
import { withAuthQuery } from "./utils/with-auth-query";

function isValidColumnId(id: Document["id"]): id is keyof Document {
  return ["title", "createdAt", "size", "embeddingStatus"].includes(id);
}

export const getAvailableDocuments = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  const session = await getSession();

  if (!session?.session.activeCourseId) {
    throw new Error("No session or active course");
  }

  let query: Document[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (["title", "createdAt", "size", "embeddingStatus"].includes(s.id)) {
          const column = document[s.id as keyof Document];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(document.createdAt);
        }
      }) ?? [asc(document.createdAt)]; // Fallback default sort

    query = await db
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

    [rowCount] = await db
      .select({ count: count() })
      .from(document)
      .where(ilike(document.title, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};

export const getDocumentById = async (id: Document["id"]) => {
  const [query] = await db
    .select({ ...getTableColumns(document) })
    .from(document)
    .where(eq(document.id, id))
    .limit(1);

  return withAuthQuery(
    async () => {
      return { query };
    },
    {
      access: {
        resource: { context: "course", type: "document", id: query.courseId },
        action: "read",
      },
    },
  );
};
