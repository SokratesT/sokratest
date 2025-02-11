import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableBody } from "@/components/ui/data-table/data-table-body";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { db } from "@/db/drizzle";
import { type File, files } from "@/db/schema/files";
import { bucketSearchParamsCache } from "@/lib/nuqs/search-params.bucket";
import { paginationSearchParamsCache } from "@/lib/nuqs/search-params.pagination";
import { sortingSearchParamsCache } from "@/lib/nuqs/search-params.sorting";
import { asc, count, desc, getTableColumns, ilike } from "drizzle-orm";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { columns } from "./_components/columns";
import { FilesDataTableSelectActions } from "./_components/files-data-table-select-actions";
import { SearchInput } from "./_components/search-input";

// TODO: Centralise this in a shared file

// Type guard function
function isValidColumnId(id: string): id is keyof File {
  return ["title", "filename", "createdAt"].includes(id);
}

const FilesPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { pageIndex, pageSize } =
    await paginationSearchParamsCache.parse(searchParams);
  const { sort } = await sortingSearchParamsCache.parse(searchParams);
  const { bucket, search } = await bucketSearchParamsCache.parse(searchParams);

  const sortOrder = sort
    ?.filter((s) => isValidColumnId(s.id))
    .map((s) => {
      if (["title", "filename", "createdAt"].includes(s.id)) {
        const column = files[s.id as keyof File];
        return s.desc ? desc(column) : asc(column);
      } else {
        return asc(files.createdAt);
      }
    }) ?? [asc(files.createdAt)]; // Fallback default sort

  const query = await db
    .select({ ...getTableColumns(files) })
    .from(files)
    .where(ilike(files.filename, `%${search}%`))
    .limit(pageSize)
    .orderBy(...sortOrder)
    .offset(pageIndex * pageSize);

  const [rowCount] = await db
    .select({ count: count() })
    .from(files)
    .where(ilike(files.filename, `%${search}%`));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Files
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/repo/add">Add File</Link>
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
