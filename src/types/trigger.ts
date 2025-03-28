import type { FilePayload } from "./file";

export interface ProcessDocumentTaskPayload {
  courseId: string;
  documentRef: Omit<FilePayload, "expiry">;
}
