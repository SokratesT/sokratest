import Link from "next/link";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { SearchInput } from "@/components/documents/search-input";
import { organizationTableColumns } from "@/components/organizations/table/organization-table-columns";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getAvailableOrganizations } from "@/db/queries/organizations";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await querySearchParamsCache.parse(searchParams);

  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "organization" },
    "update",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  const result = await getAvailableOrganizations({
    sort,
    pageIndex,
    pageSize,
    search,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Organisations
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.organizations.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Add Organisation
          </Link>
        </div>
      </div>
      <div>
        <DataTable
          data={result.data.query}
          columns={organizationTableColumns}
          options={{
            rowCount: result.data.rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
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
