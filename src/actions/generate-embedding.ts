"use server";

import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import { auth } from "@/lib/auth";
import { clientEnv } from "@/lib/env/client";
import { headers } from "next/headers";

// FIXME: Update embedding interface
interface Embedding {
  embedding: {
    node: Node;
    metadata: any;
  }[];
}

interface Node {
  id_: string;
  embedding: number[];
  text: string;
  start_char_idx: number;
  end_char_idx: number;
}

export const generateEmbedding = async (url: string, documentId: string) => {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_CHAT_API}/api/generate/single`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        id: documentId,
      }),
    },
  );

  const { embedding } = (await res.json()) as Embedding;

  embedding.map((embedding) => saveEmbedding(embedding, documentId));

  return embedding;
};

const saveEmbedding = async (
  embedding: { node: Node; metadata: any },
  documentId: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.insert(embeddings).values({
    embedding: embedding.node.embedding,
    text: embedding.node.text,
    nodeId: embedding.node.id_,
    metadata: embedding.metadata,
    fileId: documentId,
  });

  return { success: true };
};
