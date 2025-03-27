import type { ChunkPayload } from "@/types/qdrant";
import { qdrant } from "./qdrant";
import { qdrantCollections } from "./qdrant-constants";

export const upsertChunksToQdrant = async ({
  chunks,
}: {
  chunks: {
    vector: number[];
    id: string;
    payload: ChunkPayload;
  }[];
}) => {
  const points = chunks.map((chunk) => ({
    id: chunk.id,
    vector: chunk.vector,
    payload: chunk.payload,
  }));

  return qdrant.upsert(qdrantCollections.chunks.name, { points });
};
