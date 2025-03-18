import { SearchInput } from "@/components/documents/search-input";
import { OrganizationTableActions } from "@/components/organizations/table/organization-table-actions";
import { organizationTableColumns } from "@/components/organizations/table/organization-table-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getAvailableOrganizations } from "@/db/queries/organizations";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await bucketSearchParamsCache.parse(searchParams);

  const { query, rowCount } = await getAvailableOrganizations({
    sort,
    pageIndex,
    pageSize,
    search,
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Organisations
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={ROUTES.PRIVATE.organizations.add.getPath()}>
              Add Organisation
            </Link>
          </Button>
        </div>
      </div>
      <div>
        <DataTable
          data={query}
          columns={organizationTableColumns}
          options={{
            rowCount: rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <OrganizationTableActions />
            <SearchInput />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default UsersPage;
