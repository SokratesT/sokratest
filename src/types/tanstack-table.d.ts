import type { Course } from "@/db/schema/courses";
import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta {
    courseId?: Course["id"];
  }
}
