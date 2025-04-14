import type { ProcessingStatus } from "@/app/api/docs/processing/route";
import { extractMarkdownImages } from "@/lib/chunk/utils";
import { getFileTypeFromMime } from "@/lib/files/uploadHelpers";
import {
  createPresignedUrlToDownload,
  deletePrefixRecursively,
} from "@/lib/s3/file-functions";
import { s3Client } from "@/lib/s3/s3client";
import { buckets } from "@/settings/buckets";
import type { DoclingData } from "@/types/docling";
import type { ProcessDocumentTaskPayload } from "@/types/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";

export const processDocumentTask = task({
  id: "process-document-task",
  maxDuration: 600, // Stop executing after 600 secs (10 mins) of compute
  run: async (payload: ProcessDocumentTaskPayload, { ctx }) => {
    const doclingApi = `${process.env.DOCLING_API}/v1alpha/convert/source`;

    const presignedUrl = await createPresignedUrlToDownload(
      payload.documentRef,
    );

    const doclingResponse = await logger.trace("process-document", async () =>
      fetch(doclingApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DOCLING_API_KEY || "",
        },
        body: JSON.stringify({
          options: {
            image_export_mode: "embedded",
            do_ocr: false,
          },
          http_sources: [
            {
              url: presignedUrl,
            },
          ],
        }),
      }),
    );

    const processedDocument = (await doclingResponse.json()) as DoclingData;

    const { modifiedMarkdown, extractedImages } = extractMarkdownImages(
      processedDocument.document.md_content || "",
    );

    await logger.trace("clear-prefix", async () => {
      await deletePrefixRecursively({
        bucket: buckets.processed.name,
        prefix: `${payload.documentRef.id}/`,
      });
    });

    await logger.trace("upload-markdown", async () => {
      await s3Client.putObject(
        buckets.processed.name,
        `${payload.documentRef.id}/content.md`,
        Buffer.from(modifiedMarkdown, "utf-8"),
      );
    });

    // Upload each extracted image
    await logger.trace("upload-images", async () => {
      for (let i = 0; i < extractedImages.length; i++) {
        const image = extractedImages[i];
        const type = getFileTypeFromMime(image.mimeType);

        logger.info(
          `Uploading image ${i + 1} of ${extractedImages.length}: ${image.placeholder} (${type})`,
        );

        if (type === "unknown") {
          logger.error(`Unknown image type for ${image.alt}. Skipping upload.`);
          continue;
        }

        await s3Client.putObject(
          buckets.processed.name,
          `${payload.documentRef.id}/${image.placeholder}.${type}`,
          Buffer.from(image.imageData, "base64"),
        );
      }
    });

    const updateNextResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/docs/processing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: payload.documentRef.id,
          courseId: payload.courseId,
          step: "processing",
          status: "success",
        } as ProcessingStatus),
      },
    );

    if (!updateNextResponse.ok) {
      logger.error("Failed to send processing status");
      throw new Error("Failed to send processing status");
    }

    return { payload, result: { next: updateNextResponse } };
  },
});
