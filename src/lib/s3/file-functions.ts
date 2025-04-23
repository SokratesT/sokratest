import type { BucketName } from "@/settings/buckets";
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
 * List files urls in bucket by prefix
 * @returns promise with array of file references
 */
export async function listFiles({
  bucket,
  prefix,
}: { bucket: string; prefix: string }) {
  return s3Client.listObjects(bucket, prefix);
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

export async function deletePrefixRecursively({
  bucket,
  prefix,
}: { bucket: BucketName; prefix: string }) {
  // Create bucket if it doesn't exist
  const status = await createBucketIfNotExists(bucket);

  if (status.status === "forbidden") {
    throw new Error("Bucket is not allowed");
  }

  // Create a promise that resolves when all objects are deleted
  return new Promise<void>((resolve, reject) => {
    const objects = s3Client.listObjects(bucket, prefix);

    const deletePromises: Promise<void>[] = [];

    objects.on("data", (object) => {
      if (!object.name) return;
      const deletePromise = s3Client
        .removeObject(bucket, object.name)
        .catch((err) => {
          throw err;
        });
      deletePromises.push(deletePromise);
    });

    objects.on("error", (err) => {
      reject(err);
    });

    objects.on("end", async () => {
      if (deletePromises.length === 0) {
        resolve();
        return;
      }
      try {
        await Promise.all(deletePromises);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Lists all files in a bucket with the given prefix
 * @returns Promise with array of file objects
 */
export async function listAllFilesInPrefix({
  bucket,
  prefix,
}: { bucket: BucketName; prefix: string }) {
  // Create a promise that resolves with all objects found
  return new Promise<
    Array<{ name: string; lastModified?: Date; size?: number }>
  >((resolve, reject) => {
    const objects = s3Client.listObjects(bucket, prefix);

    const filesList: Array<{
      name: string;
      lastModified?: Date;
      size?: number;
    }> = [];

    objects.on("data", (object) => {
      if (!object.name) return;
      filesList.push({
        name: object.name,
        lastModified: object.lastModified,
        size: object.size,
      });
    });

    objects.on("error", (err) => {
      reject(err);
    });

    objects.on("end", () => {
      // Resolve with the complete list of files
      resolve(filesList);
    });
  });
}

export async function getMarkdownAsString({
  bucket,
  name,
}: { bucket: BucketName; name: string }) {
  const dataStream = await s3Client.getObject(bucket, name);
  const chunks: Uint8Array<ArrayBufferLike>[] = [];

  return new Promise((resolve, reject) => {
    dataStream.on("data", (chunk) => chunks.push(chunk));
    dataStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const markdownContent = buffer.toString("utf-8");
      resolve(markdownContent);
    });
    dataStream.on("error", reject);
  });
}

export async function getImageAsBase64({
  bucket,
  name,
}: {
  bucket: BucketName;
  name: string;
}) {
  const dataStream = await s3Client.getObject(bucket, name);
  const chunks: Uint8Array[] = [];

  return new Promise<string>((resolve, reject) => {
    dataStream.on("data", (chunk) => chunks.push(chunk));
    dataStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const base64Image = buffer.toString("base64");
      resolve(base64Image);
    });
    dataStream.on("error", reject);
  });
}
