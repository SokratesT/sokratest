import { getModel } from "@/lib/ai/models";
import { splitMarkdownAtHeaders } from "@/lib/chunk/markdown-chunker";
import { upsertChunksToQdrant } from "@/qdrant/mutations";

import type { DoclingData } from "@/types/docling";
import type { ProcessDocumentTaskPayload } from "@/types/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";
import { embedMany } from "ai";
import { v4 as uuidv4 } from "uuid";

export const processDocumentTask = task({
  id: "process-document-task",
  maxDuration: 600, // Stop executing after 600 secs (10 mins) of compute
  run: async (payload: ProcessDocumentTaskPayload, { ctx }) => {
    const doclingApi = `${process.env.DOCLING_API}/v1alpha/convert/source`;

    const doclingResponse = await logger.trace("process-document", async () =>
      fetch(doclingApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DOCLING_API_KEY || "",
        },
        body: JSON.stringify({
          options: {
            image_export_mode: "placeholder",
            do_ocr: false,
          },
          http_sources: [
            {
              url: payload.url,
            },
          ],
        }),
      }),
    );
    const processedDocument = (await doclingResponse.json()) as DoclingData;

    const documentChunks = await logger.trace("chunk-document", async () =>
      splitMarkdownAtHeaders(
        processedDocument.document.md_content || "",
        256, // max length in tokens
      ),
    );

    const embedResults = await logger.trace("embed-chunks", async () =>
      embedMany({
        model: getModel({ type: "embedding" }),
        values: documentChunks.map((chunk) => chunk.content),
      }),
    );

    const metaDataChunks = documentChunks.map((chunk, index) => ({
      id: uuidv4(),
      vector: embedResults.embeddings[index],
      payload: {
        course_id: payload.courseId,
        document_id: payload.documentId,
        text: embedResults.values[index],
        title: chunk.title,
        depth: chunk.depth,
        tokens: chunk.length,
        chunkIndex: index,
        chunkCount: documentChunks.length,
        createdAt: new Date().toISOString(),
      },
    }));

    const qdrantResult = await logger.trace("save-embeddings", async () =>
      upsertChunksToQdrant({
        chunks: metaDataChunks,
      }),
    );

    return { payload, result: { success: true, qdrant: qdrantResult } };
  },
});
