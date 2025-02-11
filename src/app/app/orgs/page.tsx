import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { db } from "@/db/drizzle";
import { organization } from "@/db/schema/auth";
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

type Organization = InferSelectModel<typeof organization>;

// Type guard function
function isValidColumnId(id: string): id is keyof Organization {
  return ["name", "slug"].includes(id);
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
        const column = organization[s.id as keyof Organization];
        return s.desc ? desc(column) : asc(column);
      } else {
        return asc(organization.createdAt);
      }
    }) ?? [asc(organization.createdAt)]; // Fallback default sort

  const query = await db
    .select({ ...getTableColumns(organization) })
    .from(organization)
    .where(ilike(organization.name, `%${search}%`))
    .limit(pageSize)
    .orderBy(...sortOrder)
    .offset(pageIndex * pageSize);

  const [rowCount] = await db
    .select({ count: count() })
    .from(organization)
    .where(ilike(organization.name, `%${search}%`));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Organisations
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/orgs/add">Add Organisation</Link>
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
