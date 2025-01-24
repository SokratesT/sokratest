import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { type Post, posts } from "@/db/schema/posts";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import {
  type InferSelectModel,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
} from "drizzle-orm";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { columns } from "./_components/columns";
import { PostsDataTableSelectActions } from "./_components/posts-data-table-select-actions";

interface PostWithAuthor extends Post {
  name: string | null;
}

export type User = InferSelectModel<typeof user>;

// Define valid column keys
export type ValidPostWithAuthorColumnId = keyof PostWithAuthor;

// Type guard function
export function isValidColumnId(
  id: string,
): id is ValidPostWithAuthorColumnId | keyof User {
  return ["title", "name", "createdAt"].includes(id);
}

const PostsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);

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

  const query = await db
    .select({ ...getTableColumns(posts), name: user.name })
    .from(posts)
    .limit(pageSize)
    .orderBy(...sortOrder)
    .leftJoin(user, eq(posts.author, user.id))
    .offset(pageIndex * pageSize);

  const [rowCount] = await db.select({ count: count() }).from(posts);

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Posts
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/blog">View Posts</Link>
          </Button>
          <Button asChild>
            <Link href="/app/posts/add">Add Post</Link>
          </Button>
        </div>
      </div>
      <div>
        <DataTable
          data={query}
          columns={columns}
          options={{
            rowCount: rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <PostsDataTableSelectActions />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default PostsPage;
