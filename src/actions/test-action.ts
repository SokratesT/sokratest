"use server";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { UnstructuredClient } from "unstructured-client";

const unstructuredClient = new UnstructuredClient({
  serverURL: "http://localhost:9500",
  /* security: {
    apiKeyAuth: "YOUR_API_KEY",
  }, */
});

async function downloadToBlob(url: string) {
  const response = await fetch(url);
  console.log(response);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  // TODO: Consider using a ReadableStream to avoid loading the entire file into memory
  const blob = await response.arrayBuffer(); // Get response as ArrayBuffer
  const buffer = Buffer.from(blob); // Convert ArrayBuffer to Buffer

  return buffer;
}

/* export const testAction = async (url: string) => {
  console.log("Downloading file from URL:", url);

  unstructuredClient.general
    .partition({
      partitionParameters: {
        files: {
          content: await downloadToBlob(url),
          fileName: "some_file.pdf",
        },
        chunkingStrategy: ChunkingStrategy.ByTitle,
        // splitPdfConcurrencyLevel: 1,
        // splitPdfPageRange: [1, 6],
        // overlap: 64,
        combineUnderNChars: 512,
        splitPdfPage: true,
        strategy: Strategy.HiRes,
      },
    })
    .then((res: PartitionResponse) => {
      if (res.statusCode === 200) {
        console.log(res.elements);
      }
    })
    .catch((e) => {
      console.log(e.statusCode);
      console.log(e.body);
    });
}; */

export const testAction = async (url: string) => {
  const loader = new UnstructuredLoader(
    {
      buffer: await downloadToBlob(url),
      fileName: "some_file.pdf",
    },
    {
      apiUrl: "http://127.0.0.1:9500/general/v0/general",
      chunkingStrategy: "by_title",
      combineUnderNChars: 512,
      maxCharacters: 1024,
      multiPageSections: true,
      overlap: 64,
      // strategy: "hi_res",
    },
  );
  const docs = await loader.load();

  console.log(JSON.stringify(docs));
};
