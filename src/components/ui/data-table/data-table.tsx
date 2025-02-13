"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePaginationSearchParams } from "@/lib/nuqs/search-params.pagination";
import { useSortingSearchParams } from "@/lib/nuqs/search-params.sorting";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useTransition } from "react";
import { TableProvider } from "./data-table-context";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface DataTableOptions<TData> {
  rowCount: number;
  uidAccessor: keyof TData;
  placeholderClassName?: React.ComponentProps<"div">["className"];
}

const DataTable = <TData, TValue>({
  children,
  columns,
  data,
  options,
  ...props
}: DataTableProps<TData, TValue> & { options: DataTableOptions<TData> } & {
  children: React.ReactNode;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const { rowCount, placeholderClassName, uidAccessor } = options;

  const [isLoading, startTransition] = useTransition();
  const [pagination, setPagination] =
    usePaginationSearchParams(startTransition);

  const [sorting, setSorting] = useSortingSearchParams(startTransition);

  const tableData = useMemo(
    () =>
      isLoading
        ? Array(
            pagination.pageSize > rowCount ? rowCount : pagination.pageSize,
          ).fill({})
        : data,
    [isLoading, data, pagination.pageSize],
  );

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => (
              <Skeleton className={cn("h-4 w-full", placeholderClassName)} />
            ),
          }))
        : columns,
    [isLoading, columns],
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: rowCount,
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      // A bit awkward, but this satisfies typescript
      if (typeof updater === "function") {
        setSorting({ sort: updater(sorting.sort ?? []) });
      }
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sorting.sort ?? undefined,
      pagination,
    },
    getRowId: (row) => row[uidAccessor],
  });

  return (
    <TableProvider table={table}>
      <div {...props.props} className={cn("space-y-4", props.props?.className)}>
        {children}
      </div>
    </TableProvider>
  );
};

export { DataTable };
