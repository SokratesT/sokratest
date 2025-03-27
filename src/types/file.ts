export type FileType =
  | "pdf"
  | "jpeg"
  | "png"
  | "docx"
  | "pptx"
  | "md"
  | "unknown";

export type FilePayload = {
  bucket: string;
  prefix: string;
  id: string;
  type: FileType;
  expiry?: number;
};
