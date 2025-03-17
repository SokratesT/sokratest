import { SearchInput } from "@/components/documents/search-input";
import { columns } from "@/components/documents/table/columns";
import { FilesDataTableSelectActions } from "@/components/documents/table/files-data-table-select-actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getAvailableFiles } from "@/db/queries/files";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { routes } from "@/settings/routes";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const FilesPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await bucketSearchParamsCache.parse(searchParams);

  const { query, rowCount } = await getAvailableFiles(
    sort,
    pageIndex,
    pageSize,
    search,
  );

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Files
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={routes.app.sub.documents.sub.add.path}>Add File</Link>
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
            <FilesDataTableSelectActions />
            <SearchInput />
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default FilesPage;
