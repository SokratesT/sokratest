import { logger } from "@trigger.dev/sdk";
import https from "https";
import nodeFetch from "node-fetch";
import type { ProcessingStatus } from "@/app/api/docs/processing/route";
import { getErrorMessage } from "@/lib/handle-error";
import { ROUTES } from "@/settings/routes";

export const DOCLING_API_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Creates an HTTPS agent that ignores SSL certificate errors.
 * Used for development environments with self-signed certificates.
 */
function createHttpsAgent() {
  return new https.Agent({
    rejectUnauthorized: false,
  });
}

/**
 * Sends a processing status update to the Next.js API.
 */
async function updateProcessingStatus(status: ProcessingStatus): Promise<void> {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${ROUTES.API.docs.processing.getPath()}`;

  logger.info(`Sending processing status update to: ${apiUrl}`);
  logger.info(`Request body: ${JSON.stringify(status)}`);

  const httpsAgent = createHttpsAgent();

  const response = await nodeFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SOKRATEST_API_KEY || "",
    },
    body: JSON.stringify(status),
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
}

/**
 * Reports a successful processing step to the Next.js API.
 */
export async function reportProcessingSuccess(params: {
  documentId: string;
  courseId: string;
  step: "processing" | "embedding";
  mergePages?: boolean;
}): Promise<void> {
  await logger.trace("update-next-api", async () => {
    await updateProcessingStatus({
      documentId: params.documentId,
      courseId: params.courseId,
      step: params.step,
      status: "success",
      mergePages: params.mergePages ?? false,
    });
  });
}

/**
 * Reports a failed processing step to the Next.js API.
 */
export async function reportProcessingError(params: {
  documentId: string;
  courseId: string;
  step: "processing" | "embedding";
  error: string;
}): Promise<void> {
  await logger.trace("update-next-api-error", async () => {
    try {
      await updateProcessingStatus({
        documentId: params.documentId,
        courseId: params.courseId,
        step: params.step,
        status: "error",
        error: params.error,
        mergePages: false,
      });
    } catch (notifyError) {
      // Log but don't throw - we don't want to mask the original error
      logger.error(
        `Failed to report error to API: ${notifyError instanceof Error ? notifyError.message : String(notifyError)}`,
      );
    }
  });
}

/**
 * Logs an error with stack trace if available.
 */
export function logError(context: string, error: unknown): void {
  logger.error(`${context}: ${getErrorMessage(error)}`);
  if (error instanceof Error && error.stack) {
    logger.error(`Stack trace: ${error.stack}`);
  }
}
