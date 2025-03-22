import { upsertChunksToQdrant } from "@/db/qdrant";
import { getModel } from "@/lib/ai/models";
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

export const testTask = task({
  id: "test-task",
  maxDuration: 3000, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: Payload, { ctx }) => {
    const doclingApi = `${process.env.DOCLING_API}/v1alpha/convert/source`;

    logger.info(`Processing document...`);
    const doclingResponse = await fetch(doclingApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // accept: "application/json",
        "x-api-key": process.env.DOCLING_API_KEY || "",
      },
      body: JSON.stringify({
        options: {
          image_export_mode: "placeholder",
        },
        http_sources: [
          {
            url: payload.url,
          },
        ],
      }),
    });
    const processedDocument = (await doclingResponse.json()) as DoclingData;

    logger.info(`Processed document: ${JSON.stringify(processedDocument)}`);

    logger.info(`Chunking document...`);
    const documentChunks = chunk(processedDocument.document.md_content || "", {
      minLength: 0, // number of minimum characters into chunk
      maxLength: 512, // number of maximum characters into chunk
      splitter: "paragraph", // paragraph | sentence
      overlap: 64, // number of overlap chracters
      delimiters: "", // regex for base split method
    });

    logger.info(`Chunk results: ${JSON.stringify(documentChunks)}`);

    logger.info(`Embedding chunks...`);
    const embedResults = await embedMany({
      model: getModel({ type: "embedding" }),
      values: documentChunks,
    });

    logger.info(`Embedding results: ${JSON.stringify(embedResults)}`);

    logger.info(`Uploading embeddings...`);
    /* const uploadResponse = await fetch(
      `https://test.sokratest.ai/api/ai/save-embedding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "success",
          documentId: payload.documentId,
          embedResults,
        }),
      },
    ); */

    await upsertChunksToQdrant({
      courseId: payload.courseId,
      embedManyResult: embedResults,
    });

    logger.info(`Done!`);

    return { payload, result: embedResults.embeddings[0] };
  },
});
