import { db } from "@/db/drizzle";
import { embedding } from "@/db/schema/embedding";
import { authActionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

// TODO: Check access rights

export const deleteEmbeddingsForFile = authActionClient
  .metadata({ actionName: "deleteEmbeddingsForFile" })
  .schema(z.object({ fileId: z.string() }))
  .action(async ({ parsedInput: { fileId } }) => {
    await db.delete(embedding).where(eq(embedding.fileId, fileId));

    return { error: null };
  });
