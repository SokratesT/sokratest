import { serverEnv } from "@/lib/env/server";
import { Client } from "minio";

export const s3Client = new Client({
  endPoint: serverEnv.S3_ENDPOINT,
  port: serverEnv.S3_PORT ? serverEnv.S3_PORT : undefined,
  accessKey: serverEnv.S3_ACCESS_KEY,
  secretKey: serverEnv.S3_SECRET_KEY,
  useSSL: serverEnv.S3_USE_SSL === "true",
});
