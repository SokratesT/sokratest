import type { Document } from "@/db/schema/document";
import type { FilePayload, FileType } from "./file";

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

export interface ProcessedImage {
  description: string;
  tokens: number;
  name: string;
  type: FileType;
}

export interface ProcessedFile {
  name: string;
  lastModified?: Date;
  size?: number;
}
