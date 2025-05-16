import https from "https";
import type { ProcessingStatus } from "@/app/api/docs/processing/route";
import type { Document } from "@/db/schema/document";
import { getModel } from "@/lib/ai/models";
import type { MarkdownNode } from "@/lib/chunk/markdown-chunker";
import { extractFileInfoFromReference } from "@/lib/chunk/utils";
import {
  getImageAsBase64,
  getMarkdownAsString,
  listAllFilesInPrefix,
} from "@/lib/s3/file-functions";
import {
  deleteChunksByDocumentId,
  upsertChunksToQdrant,
} from "@/qdrant/mutations";
import { buckets } from "@/settings/buckets";
import { ROUTES } from "@/settings/routes";
import type { FileType } from "@/types/file";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { logger, task } from "@trigger.dev/sdk/v3";
import { embedMany, generateText } from "ai";
import nodeFetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

// Helper function to introduce delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const vectorizeFilesTask = task({
  id: "vectorize-files-task",
  maxDuration: 1800, // Stop executing after 600 secs (30 mins) of compute
  run: async (
    payload: { prefix: string; courseId: string; documentId: Document["id"] },
    { ctx },
  ) => {
    const files = await listAllFilesInPrefix({
      bucket: buckets.processed.name,
      prefix: `${payload.prefix}/`,
    });

    const images: {
      description: string;
      tokens: number;
      name: string;
      type: FileType;
    }[] = [];
    const markdown: MarkdownNode[] = [];

    // Process files sequentially instead of in parallel
    for (const file of files) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension) {
        continue;
      } else if (fileExtension === "md" || fileExtension === "markdown") {
        const text = (await getMarkdownAsString({
          bucket: buckets.processed.name,
          name: file.name,
        })) as string;

        const processedMarkdown = await processMarkdownFile(text, file.name);
        markdown.push(...processedMarkdown);
      } else if (["jpeg", "png"].includes(fileExtension)) {
        // TODO: Expand supported file types, centralised with upload formats
        const image = await getImageAsBase64({
          bucket: buckets.processed.name,
          name: file.name,
        });

        const processedImage = await processImageFile(
          image,
          file.name,
          fileExtension as FileType,
        );

        if (processedImage) {
          images.push(processedImage);
        }
      } else {
        logger.info(`Skipping unsupported file type: ${fileExtension}`, {
          fileName: file.name,
        });
      }

      // Adding a delay to avoid rate limiting.
      // TODO: Think of a better way to handle this
      await delay(2000);
    }

    /* const mergedChunks = markdown
      .map((chunk) => {
        if (chunk.type === "image") {
          const image = images.find((img) => img.name === chunk.fileReference);
          if (image) {
            return {
              ...chunk,
              content: image.description,
              fileType: image.type,
            };
          }
          // Return the original chunk if no matching image was found
          return chunk;
        }
        // For text chunks, return them unchanged
        return chunk;
      })
      .filter(Boolean); // Remove any undefined values that might slip through */
    markdown.map((chunk) => {
      chunk;
    });

    const imageChunks = images.map((image) => ({
      content: image.description,
      depth: 0,
      length: image.tokens,
      title: image.name,
      type: "image",
    })) as MarkdownNode[];

    const mergedChunks = [...markdown, ...imageChunks];

    const qdrantResponse = await generateEmbeddings({
      chunks: mergedChunks,
      courseId: payload.courseId,
      documentId: payload.prefix,
    });

    const nextResponse = await logger.trace("update-next-api", async () => {
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${ROUTES.API.docs.processing.getPath()}`;
      const requestBody = {
        documentId: payload.documentId,
        courseId: payload.courseId,
        step: "embedding",
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
            `Failed to send processing status: ${response.status} - ${responseText}`,
          );
        }

        return response;
      } catch (error) {
        logger.error(
          `Error during API request: ${error instanceof Error ? error.message : String(error)}`,
        );
        logger.error(
          `Stack trace: ${error instanceof Error ? error.stack : "No stack trace"}`,
        );
        throw error;
      }
    });

    return { payload, results: { qdrant: qdrantResponse, next: nextResponse } };
  },
});

async function processMarkdownFile(fileContent: string, fileName: string) {
  return await logger.trace(`process-markdown-${fileName}`, async () => {
    // const markdownNodeParser = new MarkdownNodeParser();

    // const chunks = splitMarkdownAtHeaders(fileContent, 100);

    // const document = new llamaDocument({ text: fileContent });

    // const parsedDocuments = markdownNodeParser([document]);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1024,
      chunkOverlap: 128,
    });

    const parsedDocuments = await splitter.splitText(fileContent);

    const chunks = parsedDocuments.map((chunk) => ({
      title: "title",
      depth: 0,
      content: chunk,
      length: chunk.length,
      type: "text",
      fileName,
    })) as MarkdownNode[];

    // return chunks.map((chunk) => ({ ...chunk, fileName }));
    return chunks;
  });
}

async function processImageFile(
  base64Image: string,
  name: string,
  fileExtension: FileType,
) {
  return await logger.trace(`process-image-${name}`, async () => {
    const mimeType = `image/${fileExtension}`;

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const result = await generateText({
      model: getModel({ type: "vision" }),
      maxTokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "what's on this image?",
            },
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
    });

    const step = result.steps.find((step) => step.stepType === "initial");
    const imageRef = extractFileInfoFromReference(name)?.id;

    if (!step || !imageRef) return;

    return {
      description: step.text,
      tokens: step.usage.completionTokens,
      name: imageRef,
      type: mimeType.split("/")[1] as FileType,
    };
  });
}

async function generateEmbeddings({
  chunks,
  courseId,
  documentId,
}: {
  chunks: MarkdownNode[];
  courseId: string;
  documentId: string;
}) {
  // Embed the chunks
  const embedResults = await logger.trace("embed-chunks", async () =>
    embedMany({
      model: getModel({ type: "embedding" }),
      values: chunks.map((chunk) => chunk.content),
    }),
  );

  // Create metadata for each chunk
  const metaDataChunks = chunks.map((chunk, index) => {
    // Create the base payload properties common to both types
    const basePayload = {
      course_id: courseId,
      document_id: documentId,
      text: embedResults.values[index],
      title: chunk.title,
      depth: chunk.depth,
      tokens: chunk.length,
      chunkIndex: index,
      chunkCount: chunks.length,
      createdAt: new Date().toISOString(),
    };

    // Create the discriminated union part based on the chunk type
    const specificPayload =
      chunk.type === "image"
        ? {
            source: "image" as const,
            file_reference: chunk.fileReference,
            file_type: chunk.fileType,
          }
        : {
            source: "text" as const,
            file_reference: undefined,
            file_type: undefined,
          };

    // Combine them and return the complete chunk
    return {
      id: uuidv4(),
      vector: embedResults.embeddings[index],
      payload: {
        ...basePayload,
        ...specificPayload,
      },
    };
  });

  await logger.trace(
    "delete-existing-embeddings",
    async () => await deleteChunksByDocumentId({ courseId, documentId }),
  );

  // Save to Qdrant
  const qdrantResult = await logger.trace(
    "save-embeddings",
    async () =>
      await upsertChunksToQdrant({
        chunks: metaDataChunks,
      }),
  );

  return { success: true, type: "markdown", qdrant: qdrantResult };
}
