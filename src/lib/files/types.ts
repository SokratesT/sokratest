import type { FileType } from "@/types/file";

export interface ShortFileProp {
  name: string;
  size: number;
  type: FileType;
}
export interface PresignedUrlProp {
  id: string;
  url: string;
  name: string;
  size: number;
  type: FileType;
}
