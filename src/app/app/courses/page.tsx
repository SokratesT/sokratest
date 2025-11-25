import Link from "next/link";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { PageHeader } from "@/components/app/page-header";
import { columns } from "@/components/courses/table/columns";
import { CoursesDataTableSelectActions } from "@/components/courses/table/courses-data-table-select-actions";
import { SearchInput } from "@/components/documents/search-input";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getSession } from "@/db/queries/auth";
import { getUserCoursesForActiveOrganization } from "@/db/queries/course";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";

const CoursesPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const session = await getSession();

  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await querySearchParamsCache.parse(searchParams);

  const permitted = await hasPermission(
    { context: "course", id: "all", type: "course" },
    "update",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  const result = await getUserCoursesForActiveOrganization({
    sort,
    pageIndex,
    pageSize,
    search,
  });

  const hasOrganizationEditPermission = await hasPermission(
    {
      context: "organization",
      id: session?.session.activeOrganizationId,
      type: "organization",
    },
    "update",
  );

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <PageHeader
        title="Courses"
        actions={
          hasOrganizationEditPermission && (
            <Link
              href={ROUTES.PRIVATE.courses.add.getPath()}
              className={buttonVariants({ variant: "default" })}
            >
              Add Course
            </Link>
          )
        }
      />
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
            <SearchInput placeholder="Search title..." />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default CoursesPage;
