"use client";

import type { Table } from "@tanstack/react-table";
import type React from "react";
import { createContext, useContext } from "react";

type TableContextType = {
  table: Table<any> | null;
};

const TableContext = createContext<TableContextType>({ table: null });

export const useTable = () => useContext(TableContext);

const TableProvider: React.FC<
  TableContextType & { children: React.ReactNode }
> = ({ table, children }) => (
  <TableContext.Provider value={{ table }}>{children}</TableContext.Provider>
);

export { TableProvider };
