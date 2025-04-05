import "server-only";

import type { Course } from "@/db/schema/course";
import type { Document } from "@/db/schema/document";
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

export const deleteChunksByDocumentId = async ({
  documentId,
  courseId,
}: {
  documentId: Document["id"];
  courseId: Course["id"];
}) => {
  return qdrant.delete(qdrantCollections.chunks.name, {
    filter: {
      must: [
        {
          key: qdrantCollections.chunks.index.courseId,
          match: {
            value: courseId,
          },
        },
        {
          key: "document_id",
          match: {
            value: documentId,
          },
        },
      ],
    },
  });
};
