"server only";

import { db } from "@/db/drizzle";
import { type User, user } from "@/db/schema/auth";
import { type Post, posts } from "@/db/schema/posts";
import { asc, count, desc, eq, getTableColumns } from "drizzle-orm";

export const getAllPosts = async () => {
  let queryPosts: Post[] = [];

  try {
    queryPosts = await db.select().from(posts).orderBy(asc(posts.createdAt));
  } catch (error) {
    console.error(error);
  }

  return queryPosts;
};

interface PostWithAuthor extends Post {
  name: string | null;
}

// Define valid column keys
type ValidPostWithAuthorColumnId = keyof PostWithAuthor;

// Type guard function
function isValidColumnId(
  id: string,
): id is ValidPostWithAuthorColumnId | keyof User {
  return ["title", "name", "createdAt"].includes(id);
}

export const getAvailablePosts = async (
  sort: { id: string; desc: boolean }[],
  pageIndex: number,
  pageSize: number,
) => {
  let query: PostWithAuthor[] = [];
  let rowCount: { count: number } = { count: 0 };

  try {
    const sortOrder = sort
      ?.filter((s) => isValidColumnId(s.id))
      .map((s) => {
        if (s.id === "name") {
          const column = user[s.id as keyof User];
          return s.desc ? desc(column) : asc(column);
        } else if (["createdAt", "title"].includes(s.id)) {
          const column = posts[s.id as keyof Post];
          return s.desc ? desc(column) : asc(column);
        } else {
          return asc(posts.createdAt);
        }
      }) ?? [asc(posts.createdAt)]; // Fallback default sort

    query = await db
      .select({ ...getTableColumns(posts), name: user.name })
      .from(posts)
      .limit(pageSize)
      .orderBy(...sortOrder)
      .leftJoin(user, eq(posts.userId, user.id))
      .offset(pageIndex * pageSize);

    [rowCount] = await db.select({ count: count() }).from(posts);
  } catch (error) {
    console.error(error);
  }

  return { query, rowCount };
};
