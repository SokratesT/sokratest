import https from "https";
import type { ProcessingStatus } from "@/app/api/docs/processing/route";
import { extractMarkdownImages } from "@/lib/chunk/utils";
import { getFileTypeFromMime } from "@/lib/files/uploadHelpers";
import {
  createPresignedUrlToDownload,
  deletePrefixRecursively,
} from "@/lib/s3/file-functions";
import { s3Client } from "@/lib/s3/s3client";
import { buckets } from "@/settings/buckets";
import { ROUTES } from "@/settings/routes";
import type { DoclingData } from "@/types/docling";
import type { ProcessDocumentTaskPayload } from "@/types/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";
import nodeFetch from "node-fetch";
import sharp from "sharp";

// Define minimum resolution requirements
const MIN_IMAGE_WIDTH = 100; // pixels
const MIN_IMAGE_HEIGHT = 100; // pixels
const MIN_SINGLE_DIMENSION = 50; // pixels

/**
 * Validates if an image meets minimum resolution requirements
 * @param imageBuffer The image buffer to check
 * @returns An object containing validation result and metadata
 */
async function validateImageResolution(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    /* Images have to be at least 20 pixels in any dimension
    and at least 100 pixels in either width or height
    to be considered valid
    MIN_SINGLE_DIMENSION ensures very narrow or flat images are not accepted */
    const isValidResolution =
      (width >= MIN_IMAGE_WIDTH || height >= MIN_IMAGE_HEIGHT) &&
      width > MIN_SINGLE_DIMENSION &&
      height > MIN_SINGLE_DIMENSION;

    return {
      isValid: isValidResolution,
      width,
      height,
      metadata,
    };
  } catch (error) {
    logger.error(
      `Error validating image resolution: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      isValid: false,
      width: 0,
      height: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const processDocumentTask = task({
  id: "process-document-task",
  maxDuration: 1200,
  run: async (payload: ProcessDocumentTaskPayload, { ctx }) => {
    const doclingApi = `${process.env.DOCLING_API}/v1alpha/convert/source`;

    const presignedUrl = await createPresignedUrlToDownload(
      payload.documentRef,
    );

    const doclingResponse = await logger.trace("process-document", async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => {
            controller.abort();
          },
          15 * 60 * 1000,
        ); // 15 minutes timeout

        // Use the signal from the controller in the fetch call
        const response = await nodeFetch(doclingApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.DOCLING_API_KEY || "",
          },
          body: JSON.stringify({
            options: {
              image_export_mode: "embedded",
              do_ocr: false,
              images_scale: 1.0,
              pdf_backend: "pypdfium2",
            },
            http_sources: [
              {
                url: presignedUrl,
              },
            ],
          }),
          signal: controller.signal, // Connect the AbortController
        });

        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        logger.error(
          `Docling API fetch error: ${error instanceof Error ? error.message : String(error)}`,
        );

        throw error;
      }
    });

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

        // Validate image resolution before uploading
        const imageBuffer = Buffer.from(image.imageData, "base64");
        const validationResult = await validateImageResolution(imageBuffer);

        if (!validationResult.isValid) {
          logger.warn(
            `Image ${image.placeholder} has insufficient resolution (${validationResult.width}x${validationResult.height}). Minimum required: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px.`,
          );
          // You can decide whether to skip or continue with upload of small images
          // Uncomment the following line to skip small images
          continue;
        }

        await s3Client.putObject(
          buckets.processed.name,
          `${payload.documentRef.id}/${image.placeholder}.${type}`,
          imageBuffer, // Using already created buffer
        );
      }
    });

    const updateNextResponse = await logger.trace(
      "update-next-api",
      async () => {
        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${ROUTES.API.docs.processing.getPath()}`;
        const requestBody = {
          documentId: payload.documentRef.id,
          courseId: payload.courseId,
          step: "processing",
          status: "success",
        } as ProcessingStatus;

        logger.info(`Sending processing status update to: ${apiUrl}`);
        logger.info(`Request body: ${JSON.stringify(requestBody)}`);

        try {
          // Create an https agent that ignores SSL errors
          const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
          });

          const response = await nodeFetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.SOKRATEST_API_KEY || "",
            },
            body: JSON.stringify(requestBody),
            // Use the agent that ignores SSL errors
            agent: apiUrl.startsWith("https") ? httpsAgent : undefined,
          });

          const responseText = await response.text();
          logger.info(`Response status: ${response.status}`);
          logger.info(`Response body: ${responseText}`);

          if (!response.ok) {
            logger.error(
              `Failed API request with status ${response.status}: ${responseText}`,
            );
            throw new Error(
              `API request failed with status ${response.status}: ${responseText}`,
            );
          }

          return { response, text: responseText };
        } catch (error) {
          logger.error(
            `Error during API request: ${error instanceof Error ? error.message : String(error)}`,
          );
          logger.error(
            `Stack trace: ${error instanceof Error ? error.stack : "No stack trace"}`,
          );
          throw error;
        }
      },
    );

    return { payload, result: { next: updateNextResponse } };
  },
});
