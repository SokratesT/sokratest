"server only";

import { db } from "@/db/drizzle";
import {
  type FileRepository,
  fileRepository,
} from "@/db/schema/file-repository";
import { auth } from "@/lib/auth";
import { and, asc, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { headers } from "next/headers";

function isValidColumnId(id: FileRepository["id"]): id is keyof FileRepository {
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

  let query: FileRepository[] = [];
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
          const column = fileRepository[s.id as keyof FileRepository];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(fileRepository.createdAt);
        }
      }) ?? [asc(fileRepository.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(fileRepository) })
      .from(fileRepository)
      .where(
        and(
          ilike(fileRepository.filename, `%${search}%`),
          eq(fileRepository.courseId, session.session.activeCourseId),
        ),
      )
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(fileRepository)
      .where(ilike(fileRepository.filename, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};
