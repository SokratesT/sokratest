import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

// TODO: Check access rights

export const deleteEmbeddingsForFile = authActionClient
  .metadata({ actionName: "deleteEmbeddingsForFile" })
  .schema(z.object({ fileId: z.string() }))
  .action(async ({ parsedInput: { fileId } }) => {
    await db.delete(embeddings).where(eq(embeddings.fileId, fileId));

    return { error: null };
  });
