import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { logger, task, wait } from "@trigger.dev/sdk/v3";

import { Document } from "@llamaindex/core/schema";

import { createOpenAI } from "@ai-sdk/openai";
import { OllamaEmbedding } from "@llamaindex/ollama";
import { PDFReader } from "@llamaindex/readers/pdf";
import { embedMany } from "ai";

/* VectorStoreIndex */

interface Payload {
  url: string;
  documentId: string;
}

const embeddingModel = new OllamaEmbedding({
  model: "nomic-embed-text:latest",
});

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "compatible",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
  name: "ollama",
});

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: Payload, { ctx }) => {
    logger.log("Hello, world! Test:", { payload: payload.url, ctx });

    const signedUrl = payload.url;

    // Temporary file path to save the downloaded file
    const fileName = "downloaded-file.txt"; // Change as needed
    const filePath = path.join("/tmp", fileName); // Use a temporary directory

    try {
      // Step 1: Download the file
      logger.log("Downloading file from:", { signedUrl });
      await downloadFile(signedUrl, filePath);
      logger.log("File downloaded successfully:", { filePath });

      // Step 2: Process the file (example: load it as a Document)
      logger.log("Processing file...");
      const fileContent = await fs.readFile(filePath);

      const f = new PDFReader();
      const content = await f.loadDataAsContent(fileContent);

      const documents = content.map((c) => new Document({ text: c.text }));

      // const document = new Document({ text: "Test", id_: "1" });
      /* const document = new Document({
        text: fileContent,
        metadata: { source: "downloaded" }, // Add metadata as needed
      }); */
      logger.log("File processed into Document:", { documents });

      // Step 3: Build the index
      logger.log("Building index...");
      /* const pipeline = new IngestionPipeline({
        transformations: [
          // new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
          // new TitleExtractor(),
          embeddingModel,
        ],
      });

      const pipelineResult = await logger.trace(
        "pipeline.run",
        async (span) => {
          span.setAttribute("pipeline.id", "1");
          return pipeline.run({ documents: documents });
        },
      ); */

      // 'embedding' is a single embedding object (number[])
      const embedResults = await embedMany({
        model: openai.embedding("mxbai-embed-large:latest"),
        values: documents.map((d) => d.text),
      });

      // const res = await pipeline.run({ documents: documents });

      // logger.info("RES:", { res });

      /* const embedding = await logger.trace("embed-text", async (span) => {
        span.setAttribute("embed.id", "1");
        return embeddingModel.getTextEmbeddingsBatch(
          document.map((d) => d.text),
        );
      }); */

      logger.log("Index built successfully.");

      // Clean up the temporary file
      logger.log("Cleaning up temporary file...");
      await fs.unlink(filePath);
      logger.log("Temporary file deleted.");

      const response = await fetch(
        `${"http://localhost:3000"}/api/ai/save-embedding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: payload.documentId,
            embedResults,
          }),
        },
      );

      await wait.for({ seconds: 5 });

      // Return the index or any other required result
      return {
        response: await response.json(),
      };
    } catch (error) {
      logger.error("Error occurred:", { error });
      throw error;
    }
  },
});

// Helper function to download a file using fetch
async function downloadFile(
  signedUrl: string,
  downloadPath: string,
): Promise<void> {
  const response = await fetch(signedUrl);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const fileStream = createWriteStream(downloadPath);

  return new Promise((resolve, reject) => {
    if (!response.body) {
      reject(new Error("No response body"));
      return;
    }

    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    stream
      .pipeTo(
        new WritableStream({
          write(chunk) {
            fileStream.write(chunk);
          },
        }),
      )
      .then(() => {
        fileStream.end();
        resolve();
      })
      .catch(reject);
  });
}
