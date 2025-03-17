import { columns } from "@/components/posts/table/columns";
import { PostsDataTableSelectActions } from "@/components/posts/table/posts-data-table-select-actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getAvailablePosts } from "@/db/queries/posts";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { routes } from "@/settings/routes";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const PostsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);

  const { query, rowCount } = await getAvailablePosts(
    sort,
    pageIndex,
    pageSize,
  );

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Posts
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={routes.blog.path}>View Posts</Link>
          </Button>
          <Button asChild>
            <Link href={routes.app.sub.posts.sub.add.path}>Add Post</Link>
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
