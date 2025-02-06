import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import {
  type InferSelectModel,
  asc,
  count,
  desc,
  getTableColumns,
  ilike,
} from "drizzle-orm";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { columns } from "./_components/columns";
import { UsersDataTableSelectActions } from "./_components/users-data-table-select-actions";

type User = InferSelectModel<typeof user>;

// Type guard function
export function isValidColumnId(id: string): id is keyof User {
  return ["name", "email", "role"].includes(id);
}

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { bucket, search } = await bucketSearchParamsCache.parse(searchParams);

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

  const query = await db
    .select({ ...getTableColumns(user) })
    .from(user)
    .where(ilike(user.email, `%${search}%`))
    .limit(pageSize)
    .orderBy(...sortOrder)
    .offset(pageIndex * pageSize);

  const [rowCount] = await db
    .select({ count: count() })
    .from(user)
    .where(ilike(user.email, `%${search}%`));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-regular max-w-xl text-3xl tracking-tighter md:text-5xl">
          Users
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/users/add">Add User</Link>
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
            <UsersDataTableSelectActions />
            {/* <SearchInput /> */}
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default UsersPage;
