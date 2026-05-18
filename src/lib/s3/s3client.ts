import { Client } from "minio";

let _client: Client | null = null;

export function getS3Client(): Client {
  if (!_client) {
    _client = new Client({
      endPoint: process.env.S3_ENDPOINT!,
      port: Number(process.env.S3_PORT) || undefined,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      useSSL: process.env.S3_USE_SSL === "true",
    });
  }
  return _client;
}
