"server only";

import { db } from "@/db/drizzle";
import { type Document, document } from "@/db/schema/document";
import { auth } from "@/lib/auth";
import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { headers } from "next/headers";

function isValidColumnId(id: Document["id"]): id is keyof Document {
  return ["title", "filename", "createdAt", "size", "embeddingStatus"].includes(
    id,
  );
}

export const getAvailableFiles = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeCourseId) {
    throw new Error("No session or active course");
  }

  let query: Document[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (
          [
            "title",
            "filename",
            "createdAt",
            "size",
            "embeddingStatus",
          ].includes(s.id)
        ) {
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
          ilike(document.filename, `%${search}%`),
          eq(document.courseId, session.session.activeCourseId),
        ),
      )
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(document)
      .where(ilike(document.filename, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};
