import { createWriteStream, openAsBlob } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { OllamaEmbedding } from "@llamaindex/ollama";
import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { embedMany } from "ai";
import { UnstructuredClient } from "unstructured-client";
import { ChunkingStrategy } from "unstructured-client/sdk/models/shared";

// SimpleDirectoryReader,
interface Payload {
  url: string;
  documentId: string;
}

const embeddingModel = new OllamaEmbedding({
  model: "nomic-embed-text:latest",
});

const openai = createOpenAI({
  compatibility: "compatible",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
  name: "ollama",
});

const unstructuredClient = new UnstructuredClient({
  serverURL: "http://localhost:8000",
  /* security: {
    apiKeyAuth: "YOUR_API_KEY",
  }, */
});

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 3000, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: Payload, { ctx }) => {
    const signedUrl = payload.url;

    // Temporary file path to save the downloaded file
    const fileName = "downloaded-file.pdf"; // Change as needed
    const filePath = path.join("/tmp", fileName); // Use a temporary directory

    try {
      // Step 1: Download the file
      logger.log("Downloading file from:", { signedUrl });
      await downloadFile(signedUrl, filePath);
      await wait.for({ seconds: 5 });
      logger.log("File downloaded successfully:", { filePath });

      // Step 2: Process the file (example: load it as a Document)
      logger.log("Processing file...");
      // const fileContent = await fs.readFile(filePath);

      const res = await unstructuredClient.general.partition({
        partitionParameters: {
          files: {
            content: await openAsBlob(filePath),
            fileName,
          },
          chunkingStrategy: ChunkingStrategy.ByTitle,
          overlap: 64,
          // splitPdfPageRange: [1, 6],
          // strategy: Strategy.HiRes,
          languages: ["deu"],
          // splitPdfPage: false,
          combineUnderNChars: 512,
          maxCharacters: 1024,
        },
      });

      const elements = res.elements?.map((e) => e.type);

      logger.log("File processed successfully:", { res });

      // const reader = new PDFReader();
      // const documents = await reader.loadData(filePath);

      /* const pipeline = new IngestionPipeline({
        transformations: [
          new SentenceSplitter({ chunkSize: 512, chunkOverlap: 64 }),
        ],
      }); */

      // run the pipeline
      // const nodes = await pipeline.run({ documents });

      // logger.log("File processed into Text:", { nodes });

      // Step 3: Build the index
      logger.log("Building index...");

      if (!res.elements) {
        throw new Error("No elements found in the response.");
      }

      const embedResults = await embedMany({
        model: openai.embedding("mxbai-embed-large:latest"),
        values: res.elements.map((d) => d.text),
      });

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
            status: "success",
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
      await fetch(`${"http://localhost:3000"}/api/ai/save-embedding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "failed",
          documentId: payload.documentId,
        }),
      });

      logger.error("Error occurred:", { error });
      throw error;
    }
  },
});

/* async function loadRemoteFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Cannot fetch document: ${response.statusText}`);
    return;
  }
  const data = await response.arrayBuffer();
  return mupdfjs.PDFDocument.openDocument(data, url);
} */

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
