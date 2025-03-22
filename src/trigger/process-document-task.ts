import { getModel } from "@/lib/ai/models";
import { upsertChunksToQdrant } from "@/qdrant/qdrant";
import { logger, task } from "@trigger.dev/sdk/v3";
import { embedMany } from "ai";
import { chunk } from "llm-chunk";

interface Payload {
  url: string;
  documentId: string;
  courseId: string;
}

interface DoclingData {
  document: {
    filename: string;
    md_content: string | null;
    json_content: string | null;
    html_content: string | null;
    text_content: string | null;
    doctags_content: string | null;
  };
  status: string;
  errors: [];
  processing_time: number;
  timings: object;
}

export const processDocumentTask = task({
  id: "process-document-task",
  maxDuration: 600, // Stop executing after 600 secs (10 mins) of compute
  run: async (payload: Payload, { ctx }) => {
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
            table_mode: "accurate",
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
      chunk(processedDocument.document.md_content || "", {
        minLength: 0, // number of minimum characters into chunk
        maxLength: 512, // number of maximum characters into chunk
        splitter: "paragraph", // paragraph | sentence
        overlap: 64, // number of overlap chracters
        delimiters: "", // regex for base split method
      }),
    );

    const embedResults = await logger.trace("embed-chunks", async () =>
      embedMany({
        model: getModel({ type: "embedding" }),
        values: documentChunks,
      }),
    );

    const qdrantResult = await logger.trace("save-embeddings", async () =>
      upsertChunksToQdrant({
        courseId: payload.courseId,
        embedManyResult: embedResults,
      }),
    );

    return { payload, result: { success: true, qdrant: qdrantResult } };
  },
});
