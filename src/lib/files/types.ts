import { BucketName } from "@/settings/buckets";

export interface ShortFileProp {
  id: string;
  originalFileName: string;
  fileSize: number;
  bucketName: BucketName;
}
export interface PresignedUrlProp {
  originalFileName: string;
  fileSize: number;
  id: string;
  url: string;
}
