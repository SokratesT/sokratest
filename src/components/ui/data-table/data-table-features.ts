import {
  columnSizingFeature,
  columnVisibilityFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import type { Organization } from "@/db/schema/auth";
import type { Course } from "@/db/schema/course";

type DataTableMeta = {
  courseId?: Course["id"];
  organizationId?: Organization["id"];
};

// Sorting, filtering and pagination happen server-side via nuqs search
// params, so no client-side row models are registered.
const dataTableFeatures = tableFeatures({
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableMeta: metaHelper<DataTableMeta>(),
});

type DataTableFeatures = typeof dataTableFeatures;

export { type DataTableFeatures, type DataTableMeta, dataTableFeatures };
