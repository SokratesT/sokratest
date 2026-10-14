"use client";

import {
  type ColumnDef,
  functionalUpdate,
  type RowData,
  useTable,
} from "@tanstack/react-table";
import { useMemo, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginationSearchParams } from "@/lib/nuqs/search-params.pagination";
import { useSortingSearchParams } from "@/lib/nuqs/search-params.sorting";
import { cn } from "@/lib/utils";
import { TableProvider } from "./data-table-context";
import {
  type DataTableFeatures,
  type DataTableMeta,
  dataTableFeatures,
} from "./data-table-features";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
}

interface DataTableOptions<TData> {
  rowCount: number;
  uidAccessor: keyof TData;
  placeholderClassName?: React.ComponentProps<"div">["className"];
  meta?: DataTableMeta;
}

const DataTable = <TData extends RowData>({
  children,
  columns,
  data,
  options,
  ...props
}: DataTableProps<TData> & { options: DataTableOptions<TData> } & {
  children: React.ReactNode;
  props?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const { rowCount, placeholderClassName, uidAccessor, meta } = options;

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

  const table = useTable({
    features: dataTableFeatures,
    data: tableData,
    meta,
    columns: tableColumns,
    manualPagination: true,
    manualSorting: true,
    rowCount: rowCount,
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting({ sort: functionalUpdate(updater, sorting.sort ?? []) });
    },
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
