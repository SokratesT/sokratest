import { getModel } from "@/lib/ai/models";
import {
  type MarkdownNode,
  splitMarkdownAtHeaders,
} from "@/lib/chunk/markdown-chunker";
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
import type { FileType } from "@/types/file";
import { logger, task } from "@trigger.dev/sdk/v3";
import { embedMany, generateText } from "ai";
import { v4 as uuidv4 } from "uuid";

export const vectorizeFilesTask = task({
  id: "vectorize-files-task",
  maxDuration: 600, // Stop executing after 600 secs (10 mins) of compute
  run: async (payload: { prefix: string; courseId: string }, { ctx }) => {
    const list = await listAllFilesInPrefix({
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

    const results = await Promise.all(
      list.map(async (item) => {
        const fileExtension = item.name.split(".").pop()?.toLowerCase();
        if (!fileExtension) {
          return;
        } else if (fileExtension === "md" || fileExtension === "markdown") {
          const text = (await getMarkdownAsString({
            bucket: buckets.processed.name,
            name: item.name,
          })) as string;

          markdown.push(...(await processMarkdownFile(text, item.name)));
        } else if (["jpeg", "png"].includes(fileExtension)) {
          const image = await getImageAsBase64({
            bucket: buckets.processed.name,
            name: item.name,
          });

          const processedImage = await processImageFile(
            image,
            item.name,
            fileExtension as FileType,
          );

          if (!processedImage) return;

          images.push(processedImage);
        } else {
          logger.info(`Skipping unsupported file type: ${fileExtension}`, {
            fileName: item.name,
          });
          return;
        }
      }),
    );

    const mergedChunks = markdown
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
      .filter(Boolean); // Remove any undefined values that might slip through

    const result = await generateEmbeddings({
      chunks: mergedChunks,
      courseId: payload.courseId,
      documentId: payload.prefix,
    });

    return { payload, result };
  },
});

async function processMarkdownFile(fileContent: string, fileName: string) {
  return await logger.trace(`process-markdown-${fileName}`, async () => {
    const chunks = splitMarkdownAtHeaders(fileContent, 100);

    return chunks.map((chunk) => ({ ...chunk, fileName }));
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
            source: "text" as const, // Note: changed from "text" to "markdown" to match your ChunkPayload type
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
    "delete-previous-embeddings",
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
