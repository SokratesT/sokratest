import { buckets } from "@/settings/buckets";
import { s3Client } from "./s3client";

export async function createBucketIfNotExists(bucketName: string) {
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
