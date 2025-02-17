"server only";

import { db } from "@/db/drizzle";
import { asc, count, desc, getTableColumns, ilike } from "drizzle-orm";
import { type FileRepository, fileRepository } from "../schema/file-repository";

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
      .where(ilike(fileRepository.filename, `%${search}%`))
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
