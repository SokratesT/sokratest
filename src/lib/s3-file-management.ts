import * as Minio from "minio";
import { serverEnv } from "./env/server";
import { BucketName, buckets } from "@/settings/buckets";

// Create a new Minio client with the S3 endpoint, access key, and secret key
export const s3Client = new Minio.Client({
  endPoint: serverEnv.S3_ENDPOINT,
  port: serverEnv.S3_PORT ? serverEnv.S3_PORT : undefined,
  accessKey: serverEnv.S3_ACCESS_KEY,
  secretKey: serverEnv.S3_SECRET_KEY,
  useSSL: serverEnv.S3_USE_SSL === "true",
});

export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await s3Client.bucketExists(bucketName);
  const allowedBuckets = buckets.map((bucket) => bucket.name);

  if (!bucketExists && allowedBuckets.includes(bucketName)) {
    await s3Client.makeBucket(bucketName);
    // TODO: Add bucket policy
  }
}

/**
 * Generate presigned urls for uploading files to S3
 * @param files files to upload
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  path,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: BucketName;
  fileName: string;
  path?: string;
  expiry?: number;
}) {
  const filePath = path ? path + "/" + fileName : fileName;

  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  return await s3Client.presignedPutObject(bucketName, filePath, expiry);
}

export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  path,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: BucketName;
  fileName: string;
  path?: string;
  expiry?: number;
}) {
  const filePath = path ? path + "/" + fileName : fileName;

  return await s3Client.presignedGetObject(bucketName, filePath, expiry);
}

/**
 * Delete file from S3 bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @returns true if file was deleted, false if not
 */
export async function deleteFileFromBucket({
  bucketName,
  fileName,
  path,
}: {
  bucketName: BucketName;
  fileName: string;
  path?: string;
}) {
  const filePath = path ? path + "/" + fileName : fileName;

  try {
    await s3Client.removeObject(bucketName, filePath);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}
