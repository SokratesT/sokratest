import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { logger, task } from "@trigger.dev/sdk";
import { embedMany, generateText } from "ai";
import pMap from "p-map";
import { v4 as uuidv4 } from "uuid";

import { getSaiaEmbeddingModel, getSaiaModel } from "@/lib/ai/saia-models";
import type { MarkdownNode } from "@/lib/chunk/markdown-chunker";
import { getErrorMessage } from "@/lib/handle-error";
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
import {
  describeImagePrompt,
  describeTableImagePrompt,
} from "@/settings/prompts";
import type { FileType } from "@/types/file";
import type {
  ProcessedFile,
  ProcessedImage,
  VectorizeFilesTaskPayload,
} from "@/types/trigger";
import {
  logError,
  reportProcessingError,
  reportProcessingSuccess,
} from "./utils";

/**
 * Processes a markdown file and splits it into chunks if needed.
 */
async function processMarkdownFile(params: {
  fileContent: string;
  fileName: string;
  chunkingStrategy: "none" | "RecursiveCharacterTextSplitter";
}): Promise<MarkdownNode[]> {
  const { fileContent, fileName, chunkingStrategy } = params;

  return await logger.trace(`process-markdown-${fileName}`, async () => {
    if (chunkingStrategy === "none") {
      return [
        {
          title: fileName,
          depth: 0,
          content: fileContent,
          length: fileContent.length,
          type: "text",
        },
      ] as MarkdownNode[];
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1024,
      chunkOverlap: 128,
    });

    const parsedDocuments = await splitter.splitText(fileContent);

    return parsedDocuments.map((chunk) => ({
      title: fileName,
      depth: 0,
      content: chunk,
      length: chunk.length,
      type: "text",
    })) as MarkdownNode[];
  });
}

/**
 * Generates a text description of an image using vision AI.
 */
async function processImageFile(
  base64Image: string,
  name: string,
  fileExtension: FileType,
): Promise<ProcessedImage | undefined> {
  return await logger.trace(`process-image-${name}`, async () => {
    const mimeType = `image/${fileExtension}`;
    const imageType = name.startsWith("table") ? "table" : "picture";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const result = await generateText({
      model: getSaiaModel({
        input: ["image"],
        model: "gemma-3-27b-it",
      }).provider,
      maxTokens: 1024,
      system:
        imageType === "table" ? describeTableImagePrompt : describeImagePrompt,
      messages: [
        {
          role: "user",
          content: [{ type: "image", image: dataUrl }],
        },
      ],
    });

    const step = result.steps.find((step) => step.stepType === "initial");
    if (!step) return undefined;

    return {
      description: step.text,
      tokens: step.usage.completionTokens,
      name,
      type: mimeType.split("/")[1] as FileType,
    };
  });
}

/**
 * Generates embeddings for chunks and stores them in Qdrant.
 */
async function generateAndStoreEmbeddings(params: {
  chunks: MarkdownNode[];
  courseId: string;
  documentId: string;
}): Promise<{ success: boolean; type: string; qdrant: unknown }> {
  const { chunks, courseId, documentId } = params;

  // Generate embeddings
  const embedResults = await logger.trace("embed-chunks", async () =>
    embedMany({
      model: getSaiaEmbeddingModel({ model: "e5-mistral-7b-instruct" })
        .provider,
      values: chunks.map((chunk) => chunk.content),
    }),
  );

  // Create metadata for each chunk
  const metaDataChunks = chunks.map((chunk, index) => {
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

    return {
      id: uuidv4(),
      vector: embedResults.embeddings[index],
      payload: { ...basePayload, ...specificPayload },
    };
  });

  // Delete existing embeddings
  await logger.trace(
    "delete-existing-embeddings",
    async () => await deleteChunksByDocumentId({ courseId, documentId }),
  );

  // Save to Qdrant
  const qdrantResult = await logger.trace(
    "save-embeddings",
    async () => await upsertChunksToQdrant({ chunks: metaDataChunks }),
  );

  return { success: true, type: "markdown", qdrant: qdrantResult };
}

const SUPPORTED_IMAGE_EXTENSIONS = ["jpeg", "png"]; // TODO: Expand and centralize

/**
 * Processes all files in a prefix and categorizes them by type.
 */
async function processAllFiles(
  files: ProcessedFile[],
  mergePages: boolean,
): Promise<{ markdown: MarkdownNode[]; images: ProcessedImage[] }> {
  const markdown: MarkdownNode[] = [];
  const images: ProcessedImage[] = [];

  const processFile = async (file: ProcessedFile) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension) return;

    if (fileExtension === "md") {
      const text = (await getMarkdownAsString({
        bucket: buckets.processed.name,
        name: file.name,
      })) as string;

      const processedMarkdown = await processMarkdownFile({
        fileContent: text,
        fileName: file.name,
        chunkingStrategy: mergePages
          ? "RecursiveCharacterTextSplitter"
          : "none",
      });

      markdown.push(...processedMarkdown);
    } else if (SUPPORTED_IMAGE_EXTENSIONS.includes(fileExtension)) {
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
  };

  await pMap(files, processFile, { concurrency: 2 });

  return { markdown, images };
}

/**
 * Converts processed images into MarkdownNode format for embedding.
 */
function convertImagesToChunks(images: ProcessedImage[]): MarkdownNode[] {
  return images.map((image) => ({
    content: image.description,
    depth: 0,
    length: image.tokens,
    title: image.name,
    type: "image",
  })) as MarkdownNode[];
}

/**
 * Main Task
 */

export const vectorizeFilesTask = task({
  id: "vectorize-files-task",
  maxDuration: 1800, // 30 minutes
  queue: {
    name: "processing-embeddings-queue",
    concurrencyLimit: 1,
  },

  run: async (payload: VectorizeFilesTaskPayload) => {
    // Step 1: List all files in the prefix
    const files = await listAllFilesInPrefix({
      bucket: buckets.processed.name,
      prefix: `${payload.prefix}/`,
    });

    // Step 2: Process all files (markdown and images)
    const { markdown, images } = await processAllFiles(
      files,
      payload.mergePages,
    );

    // Step 3: Convert images to chunks and merge with markdown
    const imageChunks = convertImagesToChunks(images);
    const allChunks = [...markdown, ...imageChunks];

    // Step 4: Generate embeddings and store in Qdrant
    const qdrantResponse = await generateAndStoreEmbeddings({
      chunks: allChunks,
      courseId: payload.courseId,
      documentId: payload.prefix,
    });

    return {
      success: true,
      stats: {
        markdownChunks: markdown.length,
        imageChunks: imageChunks.length,
        totalChunks: allChunks.length,
      },
      qdrant: qdrantResponse,
    };
  },

  onSuccess: async ({ payload }) => {
    await reportProcessingSuccess({
      documentId: payload.documentId,
      courseId: payload.courseId,
      step: "embedding",
    });
  },

  onFailure: async ({ payload, error }) => {
    logError("Vectorize files task failed", error);

    await reportProcessingError({
      documentId: payload.documentId,
      courseId: payload.courseId,
      step: "embedding",
      error: getErrorMessage(error),
    });
  },
});
