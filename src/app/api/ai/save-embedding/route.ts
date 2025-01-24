import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import type { EmbedManyResult } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

interface Response {
  documentId: string;
  embedResults: EmbedManyResult<string>;
}

interface Node {
  id_: string;
  embedding: number[];
  text: string;
  metadata: any;
  start_char_idx: number;
  end_char_idx: number;
}

export const POST = async (req: NextRequest) => {
  const res = (await req.json()) as Response;

  const result = await saveEmbedding(res.embedResults, res.documentId);

  return NextResponse.json({ state: result }, { status: 200 });
};

// TODO: Don't save each node separately, batch insert them.
const saveEmbedding = async (
  embedResults: EmbedManyResult<string>,
  documentId: string,
) => {
  // TODO: Add authentication / authorization checks

  const embeds = transformData(embedResults, documentId);

  await db.insert(embeddings).values(embeds);

  return { success: true };
};

function transformData(data: EmbedManyResult<string>, documentId: string) {
  const { embeddings, values } = data;
  if (embeddings.length !== values.length) {
    throw new Error("Embeddings and text arrays must have the same length");
  }

  return embeddings.map((embedding, index) => ({
    embedding,
    text: values[index],
    metadata: {},
    nodeId: uuidv4(),
    fileId: documentId,
  }));
}
