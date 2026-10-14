"use client";

import type { ReactTable } from "@tanstack/react-table";
import { createContext, useContext } from "react";
import type { DataTableFeatures } from "./data-table-features";

const TableContext = createContext<{
  table: ReactTable<DataTableFeatures, any>;
} | null>(null);

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
};

const TableProvider: React.FC<{
  children: React.ReactNode;
  table: ReactTable<DataTableFeatures, any>;
}> = ({ table, children }) => (
  <TableContext.Provider value={{ table }}>{children}</TableContext.Provider>
);

export { TableProvider };
