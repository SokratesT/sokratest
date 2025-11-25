import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/search-input";
import { OrganizationMemberTableActions } from "@/components/organizations/members/table/organization-member-table-actions";
import { organizationMemberTableColumns } from "@/components/organizations/members/table/organization-member-table-columns";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getOrganizationUsers } from "@/db/queries/users";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { ROUTES } from "@/settings/routes";

const OrganizationMembersPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const { id } = await params;

  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await querySearchParamsCache.parse(searchParams);

  const result = await getOrganizationUsers({
    sort,
    pageIndex,
    pageSize,
    search,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const { query, rowCount } = result.data;

  return (
    <div className="flex flex-col gap-14">
      <PageHeader
        title="Organisation Members"
        actions={
          <Link
            href={ROUTES.PRIVATE.users.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Invite Users
          </Link>
        }
      />
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
            <SearchInput placeholder="Search email..." />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default OrganizationMembersPage;
