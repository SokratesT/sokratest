"server only";

import { db } from "@/db/drizzle";
import {
  type InferSelectModel,
  asc,
  count,
  desc,
  getTableColumns,
  ilike,
} from "drizzle-orm";
import { user } from "../schema/auth";

type User = InferSelectModel<typeof user>;

// TODO: Centralise this in a shared file

// Type guard function
function isValidColumnId(id: string): id is keyof User {
  return ["name", "email", "role"].includes(id);
}

export const getAvailableUsers = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
  search: string,
) => {
  let query: User[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (["name", "email", "role"].includes(s.id)) {
          const column = user[s.id as keyof User];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(user.createdAt);
        }
      }) ?? [asc(user.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .where(ilike(user.email, `%${search}%`))
      .limit(pageSize)
      .orderBy(...sortOrder)
      .offset(pageIndex * pageSize);

    [rowCount] = await db
      .select({ count: count() })
      .from(user)
      .where(ilike(user.email, `%${search}%`));
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};
