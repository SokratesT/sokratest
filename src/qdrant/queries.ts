"server only";

import { withAuthQuery } from "@/db/queries/utils/with-auth-query";
import type { Document } from "@/db/schema/document";
import { generateEmbedding } from "@/lib/ai/embedding";
import type { QdrantPoints } from "@/types/qdrant";
import { qdrant } from "./qdrant";
import { qdrantCollections } from "./qdrant-constants";

export const getChunks = async ({ search }: { search: string }) => {
  return withAuthQuery(
    async (session) => {
      const embeddedSearch = await generateEmbedding(search);

      const query = (await qdrant.query(qdrantCollections.chunks.name, {
        query: embeddedSearch,
        filter: {
          must: [
            {
              key: qdrantCollections.chunks.index.courseId,
              match: {
                value: session.session.activeCourseId,
              },
            },
          ],
        },
        limit: 20,
        with_payload: true,
        score_threshold: 0.5,
        // FIXME: Not liking this, but qdrant types are not flexible enough
      })) as unknown as QdrantPoints;

      return { query };
    },
    {
      requireCourse: true,
    },
  );
};

export const getChunksByDocument = async ({
  documentId,
}: { documentId: Document["id"] }) => {
  return withAuthQuery(
    async (session) => {
      const query = (await qdrant.scroll(qdrantCollections.chunks.name, {
        filter: {
          must: [
            {
              key: qdrantCollections.chunks.index.courseId,
              match: {
                value: session.session.activeCourseId,
              },
            },
            {
              key: "document_id", // TODO: get type properly
              match: {
                value: documentId,
              },
            },
          ],
        },

        limit: 1000,

        order_by: qdrantCollections.chunks.index.chunkIndex,

        with_payload: true,
        with_vector: false,

        // FIXME: Not liking this, but qdrant types are not flexible enough
      })) as unknown as QdrantPoints;

      return { query };
    },
    {
      requireCourse: true,
    },
  );
};
