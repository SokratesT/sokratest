import { saveFileInfoInDB } from "@/actions/upload-file";
import { clientEnv } from "../env/client";
import type { PresignedUrlProp, ShortFileProp } from "./types";

/**
 * Gets presigned urls for uploading files to S3
 * @param formData form data with files to upload
 * @returns
 */
export const getPresignedUrls = async (files: ShortFileProp[]) => {
  const response = await fetch("/api/files/upload/presignedUrl", {
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
export const uploadToS3 = async (
  presignedUrl: PresignedUrlProp,
  file: File,
) => {
  const response = await fetch(presignedUrl.url, {
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
  bucket: string,
  presignedUrls: PresignedUrlProp[],
  onUploadSuccess: () => void,
) => {
  const uploadToS3Response = await Promise.all(
    presignedUrls.map((presignedUrl) => {
      const file = files.find(
        (file) =>
          file.name === presignedUrl.originalFileName &&
          file.size === presignedUrl.fileSize,
      );

      if (!file) {
        throw new Error("File not found");
      }

      return uploadToS3(presignedUrl, file).then(async (res) => {
        if (res.status === 200) {
          await saveFileInfoInDB(
            [presignedUrl],
            bucket,
            getFileTypeFromMime(file),
          );
        }
        return res;
      });
    }),
  );

  if (uploadToS3Response.some((res) => res.status !== 200)) {
    alert("Upload failed");
    return;
  }

  // await saveFileInfoInDB(presignedUrls);
  onUploadSuccess();
};

interface FileProps {
  id: string;
}

export async function getPresignedUrl(file: FileProps) {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_BASE_URL}/api/files/download/presignedUrl/${file.id}`,
  );

  console.log(response);

  return (await response.json()) as string;
}

export const downloadFile = async (file: FileProps) => {
  const presignedUrl = await getPresignedUrl(file);
  window.open(presignedUrl, "_blank");
};

export function getFileTypeFromMime(file: File): string {
  const mimeType = file.type;
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    return "video";
  } else if (mimeType.startsWith("text/")) {
    return "text";
  } else if (mimeType.startsWith("application/pdf")) {
    return "pdf";
  } else {
    return "unknown";
  }
}
