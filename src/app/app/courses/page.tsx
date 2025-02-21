import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getUserActiveOrganizationCourses } from "@/db/queries/courses";
import { auth } from "@/lib/auth";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { headers } from "next/headers";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { columns } from "./_components/columns";
import { CoursesDataTableSelectActions } from "./_components/courses-data-table-select-actions";

const CoursesPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("No session or active organization");
  }

  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);

  const { query, rowCount } = await getUserActiveOrganizationCourses({
    sort,
    pageIndex,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Courses
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/courses/add">Add Course</Link>
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
            <CoursesDataTableSelectActions />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default CoursesPage;
