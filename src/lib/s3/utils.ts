import { buckets } from "@/settings/buckets";
import { getS3Client } from "./s3client";

export async function createBucketIfNotExists(bucketName: string) {
  const s3Client = getS3Client();
  const bucketExists = await s3Client.bucketExists(bucketName);
  const allowedBuckets = Object.keys(buckets).map(
    (bucket) => buckets[bucket as keyof typeof buckets].name,
  );

  if (!allowedBuckets.includes(bucketName)) {
    return {
      status: "forbidden",
    };
  }

  if (!bucketExists) {
    await s3Client.makeBucket(bucketName);
    // TODO: Add bucket policy
    return { status: "created" };
  }

  return { status: "exists" };
}
