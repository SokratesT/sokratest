import { deleteEmbeddingsForFile } from "@/actions/embedding";
import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import { embedding } from "@/db/schema/embedding";
import { routes } from "@/settings/routes";
import type { EmbedManyResult } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

interface Response {
  status: "failed" | "success";
  documentId: string;
  embedResults?: EmbedManyResult<string>;
}

export const POST = async (req: NextRequest) => {
  const res = (await req.json()) as Response;

  if (res.status === "failed" || !res.embedResults) {
    await db
      .update(document)
      .set({ embeddingStatus: "failed" })
      .where(eq(document.id, res.documentId));

    return NextResponse.json({ state: { success: false } }, { status: 200 });
  }

  const result = await saveEmbedding(res.embedResults, res.documentId);
  revalidatePath(routes.app.sub.documents.path);
  // res.

  return NextResponse.json({ state: result }, { status: 200 });
};

const saveEmbedding = async (
  embedResults: EmbedManyResult<string>,
  documentId: string,
) => {
  // TODO: Add authentication / authorization checks

  await deleteEmbeddingsForFile({ fileId: documentId });

  const embeds = transformData(embedResults, documentId);

  await db.insert(embedding).values(embeds);
  await db
    .update(document)
    .set({ embeddingStatus: "done" })
    .where(eq(document.id, documentId));

  return { success: true };
};

function transformData(data: EmbedManyResult<string>, documentId: string) {
  const { embeddings, values } = data;
  if (embeddings.length !== values.length) {
    throw new Error("Embeddings and text arrays must have the same length");
  }

  return embeddings.map((embedding, index) => ({
    vector: embedding,
    text: values[index],
    metadata: {},
    nodeId: uuidv4(),
    fileId: documentId,
  }));
}
