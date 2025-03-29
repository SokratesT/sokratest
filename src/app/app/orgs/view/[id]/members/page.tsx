import { OrganizationMemberTableActions } from "@/components/organizations/members/table/organization-member-table-actions";
import { organizationMemberTableColumns } from "@/components/organizations/members/table/organization-member-table-columns";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getSession } from "@/db/queries/auth";
import { getOrganizationUsers } from "@/db/queries/users";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const OrganizationMembersPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    throw new Error("No session or active organization");
  }

  const { id } = await params;

  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);

  const { query, rowCount } = await getOrganizationUsers(id, {
    sort,
    pageIndex,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Organisation Members
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.users.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Add Users
          </Link>
        </div>
      </div>
      <div>
        <DataTable
          data={query}
          columns={organizationMemberTableColumns}
          options={{
            rowCount: rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
            meta: { organizationId: id },
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <OrganizationMemberTableActions organizationId={id} />
            {/* <SearchInput /> */}
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default OrganizationMembersPage;
