import { AddCourseMembers } from "@/components/courses/members/add-course-members";
import { CourseMemberTableActions } from "@/components/courses/members/table/course-member-table-actions";
import { courseMemberTableColumns } from "@/components/courses/members/table/course-member-table-columns";
import { Placeholder } from "@/components/placeholders/placeholder";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import {
  getCourseUsers,
  getOrganizationUsersNotInCourse,
} from "@/db/queries/users";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import type { SearchParams } from "nuqs/server";

const UsersPage = async ({
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
  const { search } = await bucketSearchParamsCache.parse(searchParams);

  const resultOrgUsersNotInCourse =
    await getOrganizationUsersNotInCourse(search);

  if (!resultOrgUsersNotInCourse.success) {
    return <Placeholder>{resultOrgUsersNotInCourse.error.message}</Placeholder>;
  }

  const organizationUsers = resultOrgUsersNotInCourse.data.query;

  const result = await getCourseUsers({
    sort,
    pageIndex,
    pageSize,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }
  const { query, rowCount } = result.data;

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
          columns={courseMemberTableColumns}
          options={{
            rowCount: rowCount.count,
            uidAccessor: "id",
            placeholderClassName: "h-8",
            meta: { courseId: id },
          }}
        >
          <div className="flex items-center gap-2">
            <DataTableViewOptions />
            <CourseMemberTableActions courseId={id} />
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
