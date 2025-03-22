import { createOpenAI } from "@ai-sdk/openai";
import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { embedMany } from "ai";
// import { SentenceSplitter } from "@llamaindex/core/node-parser";
import { SentenceSplitter } from "llamaindex";

interface Payload {
  url: string;
  documentId: string;
}

interface DoclingResponse {
  filename: string;
  markdown: string;
  images: {
    type: string;
    filename: string;
    image: string;
  }[];
  error: string;
}

const openai = createOpenAI({
  compatibility: "compatible",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
  name: "ollama",
});

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 3000, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: Payload, { ctx }) => {
    const signedUrl = payload.url;
    const doclingUrl = "http://localhost:8080/documents/convert";

    try {
      // Fetch the file from the signed URL
      const fileResponse = await fetch(signedUrl);
      if (!fileResponse.ok)
        throw new Error("Failed to fetch the file from signed URL");

      // Convert the response to a Blob
      const fileBlob = await fileResponse.blob();

      // Create a File object with a meaningful name
      const file = new File([fileBlob], "document.pdf", {
        type: fileBlob.type,
      });

      logger.log("Processing file...");

      const formData = new FormData();
      formData.append("document", file);
      formData.append("extract_tables_as_images", "true");
      formData.append("image_resolution_scale", "4");

      const res = await fetch(doclingUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          // The `Content-Type` header is automatically set by `FormData`
        },
        body: formData,
      });

      const json = (await res.json()) as DoclingResponse;

      logger.log("File processed successfully:", { json });

      const splitter = new SentenceSplitter({
        chunkSize: 512,
        chunkOverlap: 64,
      });
      /* const splitter = new MarkdownNodeParser();
      const nodes = splitter.getNodesFromDocuments([
        new Document({ text: json.markdown }),
      ]);
      const output = nodes.map((node) => node.text); */

      const output = splitter.splitText(json.markdown);

      // Step 3: Build the index
      logger.log("Building index...");

      const embedResults = await embedMany({
        model: openai.embedding("mxbai-embed-large:latest"),
        values: output.map((d) => d),
      });

      logger.log("Index built successfully.");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/save-embedding`,
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
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/save-embedding`, {
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
