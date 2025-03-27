import type { FilePayload } from "@/types/file";
import { s3Client } from "./s3client";
import { createBucketIfNotExists } from "./utils";

/**
 * Generate presigned urls for uploading files to S3
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToUpload({
  bucket,
  prefix,
  id,
  type,
  expiry = 60 * 60, // 1 hour
}: FilePayload) {
  const filePath = `${prefix}/${id}.${type}`;

  // Create bucket if it doesn't exist
  const status = await createBucketIfNotExists(bucket);

  if (status.status === "forbidden") {
    throw new Error("Bucket is not allowed");
  }

  return await s3Client.presignedPutObject(bucket, filePath, expiry);
}

/**
 * Generate presigned urls for downloading files from S3
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToDownload({
  bucket,
  prefix,
  id,
  type,
  expiry = 60 * 60, // 1 hour
}: FilePayload) {
  const filePath = `${prefix}/${id}.${type}`;

  return await s3Client.presignedGetObject(bucket, filePath, expiry);
}

/**
 * Delete file from S3 bucket
 * @returns true if file was deleted, false if not
 */
export async function deleteFileFromBucket({
  bucket,
  prefix,
  id,
  type,
}: Omit<FilePayload, "expiry">) {
  const filePath = `${prefix}/${id}.${type}`;

  try {
    await s3Client.removeObject(bucket, filePath);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}
