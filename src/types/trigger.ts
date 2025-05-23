import type { Document } from "@/db/schema/document";
import type { FilePayload } from "./file";

export interface ProcessDocumentTaskPayload {
  courseId: string;
  documentRef: Omit<FilePayload, "expiry">;
  mergePages: boolean;
}

export interface VectorizeFilesTaskPayload {
  prefix: string;
  courseId: string;
  documentId: Document["id"];
  mergePages: boolean;
}
