import { logger, task } from "@trigger.dev/sdk";
import nodeFetch from "node-fetch";

import {
  type SerializedDocument,
  serializeDoclingDocument,
} from "@/lib/ai/docling-serialize";
import { validateImageResolution } from "@/lib/files/image-validation";
import { getFileTypeFromMime } from "@/lib/files/uploadHelpers";
import { getErrorMessage } from "@/lib/handle-error";
import {
  createPresignedUrlToDownload,
  deletePrefixRecursively,
} from "@/lib/s3/file-functions";
import { s3Client } from "@/lib/s3/s3client";
import { buckets } from "@/settings/buckets";
import type { SaiaDoclingData } from "@/types/docling";
import type { ProcessDocumentTaskPayload } from "@/types/trigger";
import {
  DOCLING_API_TIMEOUT_MS,
  logError,
  reportProcessingError,
  reportProcessingSuccess,
} from "./utils";

const IMAGE_UPSCALE_FACTOR = 2; // TODO: Make this configurable

/**
 * Downloads a document from S3 using a presigned URL.
 */
async function downloadDocument(
  documentRef: ProcessDocumentTaskPayload["documentRef"],
): Promise<Blob> {
  const presignedUrl = await createPresignedUrlToDownload(documentRef);

  const response = await logger.trace("download-file", async () => {
    const res = await nodeFetch(presignedUrl);

    if (!res.ok) {
      throw new Error(
        `Failed to download file: ${res.status} ${res.statusText}`,
      );
    }

    return res;
  });

  return response.blob();
}

/**
 * Sends a document to the Docling API for processing.
 */
async function processWithDocling(fileBlob: Blob): Promise<SaiaDoclingData> {
  const doclingApi = `${process.env.OPENAI_COMPATIBLE_BASE_URL}/documents/convert`;

  const response = await logger.trace("process-document", async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      DOCLING_API_TIMEOUT_MS,
    );

    try {
      const formData = new FormData();
      formData.append("document", fileBlob);

      const params = new URLSearchParams({
        response_type: "json",
        extract_tables_as_images: "true",
      });

      const res = await nodeFetch(`${doclingApi}?${params}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_COMPATIBLE_API_KEY}`,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Docling API returned ${res.status}: ${errorText}`);
      }

      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const responseText = await response.text();
  return JSON.parse(responseText) as SaiaDoclingData;
}

/**
 * Uploads markdown content for a page to S3.
 */
async function uploadMarkdownPage(
  documentId: string,
  pageNumber: number,
  markdown: string,
): Promise<void> {
  await s3Client.putObject(
    buckets.processed.name,
    `${documentId}/page-${pageNumber}.md`,
    Buffer.from(markdown, "utf-8"),
  );
}

/**
 * Uploads an image to S3 if it meets resolution requirements.
 */
async function uploadImage(
  documentId: string,
  image: NonNullable<SerializedDocument["images"][number]>,
): Promise<boolean> {
  const validationResult = validateImageResolution(
    image.size,
    IMAGE_UPSCALE_FACTOR,
  );

  if (!validationResult.isValid) {
    logger.warn(
      `Skipping image ${image.label}-${image.index}: insufficient resolution (${validationResult.width}x${validationResult.height})`,
    );
    return false;
  }

  const imageData = image.uri.includes("base64,")
    ? image.uri.split("base64,")[1]
    : image.uri;

  const imageBuffer = Buffer.from(imageData, "base64");
  const fileType = getFileTypeFromMime(image.mimetype);

  await s3Client.putObject(
    buckets.processed.name,
    `${documentId}/${image.label}-${image.index}.${fileType}`,
    imageBuffer,
  );

  return true;
}

/**
 * Uploads all pages and images from serialized document content to S3.
 */
async function uploadProcessedContent(
  documentId: string,
  pages: SerializedDocument[],
): Promise<void> {
  await logger.trace("upload-pages", async () => {
    if (pages.length === 0) {
      logger.info("No serialized docling content to upload.");
      return;
    }

    await Promise.all(
      pages.map(async (page) => {
        // Upload markdown
        await logger.trace(`upload-markdown-page-${page.page}`, async () => {
          await uploadMarkdownPage(documentId, page.page, page.markdown);
        });

        // Upload images
        await logger.trace(`upload-images-page-${page.page}`, async () => {
          await Promise.all(
            page.images.map(async (image) => {
              if (!image) {
                return;
              }

              logger.info(
                `Processing image ${image.label}-${image.index} (${image.mimetype})`,
              );
              await uploadImage(documentId, image);
            }),
          );
        });
      }),
    );
  });
}

/**
 * Main task
 */

export const processDocumentTask = task({
  id: "process-document-task",
  maxDuration: 1200, // 20 minutes
  queue: {
    name: "processing-documents-queue",
    concurrencyLimit: 2,
  },

  run: async (payload: ProcessDocumentTaskPayload) => {
    const documentId = payload.documentRef.id;

    // Step 1: Download the document
    const fileBlob = await downloadDocument(payload.documentRef);

    // Step 2: Process with Docling API
    const processedDocument = await processWithDocling(fileBlob);

    // Step 3: Serialize the document
    const serializedPages = serializeDoclingDocument(
      processedDocument.json_data,
      {
        keepImageRefs: true,
        mergePages: payload.mergePages,
      },
    );

    // Step 4: Clear existing processed files
    await logger.trace("clear-prefix", async () => {
      await deletePrefixRecursively({
        bucket: buckets.processed.name,
        prefix: `${documentId}/`,
      });
    });

    // Step 5: Upload processed content
    if (serializedPages) {
      await uploadProcessedContent(documentId, serializedPages);
    }

    return { success: true, documentId };
  },

  onSuccess: async ({ payload }) => {
    await reportProcessingSuccess({
      documentId: payload.documentRef.id,
      courseId: payload.courseId,
      step: "processing",
      mergePages: payload.mergePages,
    });
  },

  onFailure: async ({ payload, error }) => {
    logError("Process document task failed", error);

    await reportProcessingError({
      documentId: payload.documentRef.id,
      courseId: payload.courseId,
      step: "processing",
      error: getErrorMessage(error),
    });
  },
});
