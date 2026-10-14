"use client";

import type { Header, RowData } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import { DownloadIcon } from "lucide-react";
import { type ComponentProps, isValidElement } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTable } from "./data-table-context";
import type { DataTableFeatures } from "./data-table-features";

/**
 * Resolves the plain-text title of a column header. Function headers are
 * rendered and, if they return an element with a string `title` prop (like
 * `DataTableColumnHeader`), that title is used. Falls back to the column id.
 */
const getHeaderText = <TData extends RowData>(
  header: Header<DataTableFeatures, TData, unknown>,
): string => {
  const template = header.column.columnDef.header;
  const rendered =
    typeof template === "function" ? template(header.getContext()) : template;

  if (typeof rendered === "string") return rendered;
  if (
    isValidElement<{ title?: unknown }>(rendered) &&
    typeof rendered.props.title === "string"
  ) {
    return rendered.props.title;
  }
  return header.column.id;
};

const toCsvField = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const downloadCsv = (fileName: string, lines: unknown[][]) => {
  const csv = lines.map((line) => line.map(toCsvField).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const DataTableExportButton = ({
  fileName,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: { fileName: string } & ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>) => {
  const { table } = useTable();

  if (!table) return null;

  const handleExportToCsv = (): void => {
    // Only visible data columns, so selection and action columns are skipped
    const headers = table
      .getLeafHeaders()
      .filter(
        (header) =>
          header.column.getIsVisible() &&
          typeof header.column.accessorFn !== "undefined",
      );

    const rows = table
      .getCoreRowModel()
      .rows.map((row) =>
        headers.map((header) => row.getValue(header.column.id)),
      );

    downloadCsv(fileName, [headers.map(getHeaderText), ...rows]);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className, "h-8")}
      onClick={handleExportToCsv}
      {...props}
    >
      {children ?? (
        <>
          <DownloadIcon /> Download
        </>
      )}
    </Button>
  );
};

export { DataTableExportButton };
