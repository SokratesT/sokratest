"server only";

import { withAuthQuery } from "@/db/queries/utils/with-auth-query";
import { generateEmbedding } from "@/lib/ai/embedding";
import type { QdrantChunk } from "@/types/qdrant";
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
              key: qdrantCollections.chunks.index.name,
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
      })) as unknown as QdrantChunk;

      return { query };
    },
    {
      requireCourse: true,
    },
  );
};
