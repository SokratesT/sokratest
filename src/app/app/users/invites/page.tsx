import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/search-input";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTableExportButton } from "@/components/ui/data-table/data-table-export-button";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { InvitesTableActions } from "@/components/users/invites/table/invites-table-actions";
import { invitesTableColumns } from "@/components/users/invites/table/invites-table-columns";
import { getCourseInvitations } from "@/db/queries/course-invitation";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
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

  const result = await getCourseInvitations({
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
        title="Course Invitations"
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
          columns={invitesTableColumns}
          options={{
            rowCount: rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <InvitesTableActions />
            <DataTableExportButton fileName="invitations" />
            <SearchInput placeholder="Search email..." />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default UsersPage;
