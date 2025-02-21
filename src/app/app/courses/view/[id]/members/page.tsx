import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import {
  getCourseUsers,
  getOrganizationUsersNotInCourse,
} from "@/db/queries/users";
import { auth } from "@/lib/auth";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";
import { AddCourseMembers } from "./_components/add-course-members";
import { columns } from "./_components/columns";
import { MembersDataTableSelectActions } from "./_components/members-data-table-select-actions";

const UsersPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeOrganizationId) {
    throw new Error("No session or active organization");
  }

  const { id } = await params;

  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await bucketSearchParamsCache.parse(searchParams);

  const { query: organizationUsers } = await getOrganizationUsersNotInCourse(
    search,
    session.session.activeOrganizationId,
    id,
  );

  const { query, rowCount } = await getCourseUsers(id, {
    sort,
    pageIndex,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Course Members
        </h4>
        <div className="flex gap-2">
          <AddCourseMembers availableUsers={organizationUsers} courseId={id} />
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
            meta: { courseId: id },
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <MembersDataTableSelectActions courseId={id} />
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
