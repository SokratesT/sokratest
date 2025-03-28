import { saveDocumentInfo } from "@/db/actions/document";
import type { Document } from "@/db/schema/document";
import { clientEnv } from "@/lib/env/client";
import type { BucketName } from "@/settings/buckets";
import type { FileType } from "@/types/file";
import type { PresignedUrlProp, ShortFileProp } from "./types";

/**
 * Gets presigned urls for uploading files to S3
 * @param formData form data with files to upload
 * @returns
 */
export const getPresignedUrls = async (files: ShortFileProp[]) => {
  const response = await fetch("/api/docs/upload/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(files),
  });
  return (await response.json()) as PresignedUrlProp[];
};

/**
 * Uploads file to S3 directly using presigned url
 * @param presignedUrl presigned url for uploading
 * @param file  file to upload
 * @returns  response from S3
 */
export const uploadToS3 = async (presignedUrl: string, file: File) => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "Access-Control-Allow-Origin": "*",
    },
  });
  return response;
};

/**
 * Uploads files to S3 and saves file info in DB
 * @param files files to upload
 * @param presignedUrls  presigned urls for uploading
 * @param onUploadSuccess callback to execute after successful upload
 * @returns
 */
export const handleUpload = async (
  files: File[],
  onUploadSuccess: () => void,
) => {
  const filesInfo: ShortFileProp[] = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: getFileTypeFromMime(file.type),
  }));

  const presignedUrls = await getPresignedUrls(filesInfo);

  const uploadToS3Response = await Promise.all(
    presignedUrls.map(async (presignedUrl) => {
      const file = files.find(
        (file) =>
          file.name === presignedUrl.name && file.size === presignedUrl.size,
      );

      if (!file) {
        throw new Error("File not found");
      }

      return uploadToS3(presignedUrl.url, file).then(async (res) => {
        if (res.status === 200) {
          await saveDocumentInfo({
            id: presignedUrl.id,
            title: presignedUrl.name,
            size: presignedUrl.size,
            fileType: presignedUrl.type,
          });
        }
        return res;
      });
    }),
  );

  if (uploadToS3Response.some((res) => res.status !== 200)) {
    alert("Upload failed");
    return;
  }

  onUploadSuccess();
};

export async function getPresignedUrl(
  params:
    | { fileId: string }
    | { fileId: string; prefix: string; type: FileType; bucket: BucketName },
) {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_BASE_URL}/api/docs/download/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get presigned URL: ${response.statusText}`);
  }

  return (await response.json()) as string;
}

export const downloadFile = async ({ id }: { id: Document["id"] }) => {
  const presignedUrl = await getPresignedUrl({ fileId: id });
  window.open(presignedUrl, "_blank");
};

export function getFileTypeFromMime(mimeType: File["type"]): FileType {
  if (mimeType.startsWith("image/jpeg")) {
    return "jpeg";
    /* } else if (mimeType.startsWith("video/")) {
    return "video"; */
  } else if (mimeType.startsWith("image/png")) {
    return "png";
  } else if (mimeType.startsWith("text/markdown")) {
    return "md";
  } else if (mimeType.startsWith("application/pdf")) {
    return "pdf";
  } else {
    return "unknown";
  }
}
