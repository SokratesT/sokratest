import { RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { RefreshButton } from "@/components/app/refresh-button";
import { SearchInput } from "@/components/documents/search-input";
import { columns } from "@/components/documents/table/columns";
import { DocumentTableActions } from "@/components/documents/table/document-table-actions";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { getActiveCourseDocuments } from "@/db/queries/document";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { ROUTES } from "@/settings/routes";

const DocumentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { search } = await querySearchParamsCache.parse(searchParams);

  const result = await getActiveCourseDocuments({
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
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Documents
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.documents.playground.getPath()}
            className={buttonVariants({ variant: "outline" })}
          >
            Playground
          </Link>

          <Link
            href={ROUTES.PRIVATE.documents.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Add Document
          </Link>
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
            <DocumentTableActions />
            <SearchInput placeholder="Search title..." />
            <RefreshButton variant="ghost" size="sm">
              <RefreshCwIcon />
              Update Status
            </RefreshButton>
          </div>
          <DataTableBody />
          <DataTablePagination />
        </DataTable>
      </div>
    </div>
  );
};

export default DocumentsPage;
