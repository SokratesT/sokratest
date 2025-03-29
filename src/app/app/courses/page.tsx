import { columns } from "@/components/courses/table/columns";
import { CoursesDataTableSelectActions } from "@/components/courses/table/courses-data-table-select-actions";
import { buttonVariants } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getUserCoursesForActiveOrganization } from "@/db/queries/course";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const CoursesPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);

  const result = await getUserCoursesForActiveOrganization({
    sort,
    pageIndex,
    pageSize,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Courses
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.courses.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Add Course
          </Link>
        </div>
      </div>
      <div>
        <DataTable
          data={result.data.query}
          columns={columns}
          options={{
            rowCount: result.data.rowCount.count,
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
