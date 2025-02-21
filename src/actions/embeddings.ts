import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import type { FileRepository } from "@/db/schema/file-repository";
import { eq } from "drizzle-orm";

export const deleteEmbeddingsForFile = async (fileId: FileRepository["id"]) => {
  // TODO: Check access rights

  try {
    await db.delete(embeddings).where(eq(embeddings.fileId, fileId));
  } catch (error) {
    console.error("Failed to delete embeddings for file in database", error);
    throw error;
  }
};
