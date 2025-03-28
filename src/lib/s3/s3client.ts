import { Client } from "minio";

export const s3Client = new Client({
  endPoint: process.env.S3_ENDPOINT || "",
  port: Number(process.env.S3_PORT) || 9000,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  useSSL: process.env.S3_USE_SSL === "true",
});
