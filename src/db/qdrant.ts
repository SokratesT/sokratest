import { serverEnv } from "@/lib/env/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { EmbedManyResult } from "ai";
import { v4 as uuidv4 } from "uuid";

const collectionName = "sokratest-documents";

let client: QdrantClient | null = null;

export const getQdrantClient = async (): Promise<QdrantClient> => {
  if (client) return client;

  client = new QdrantClient({
    url: serverEnv.QDRANT_URL,
    port: null,
    apiKey: serverEnv.QDRANT_API_KEY,
  });

  // Init only once when client is first created
  await initCollectionIfNeeded(client);

  return client;
};

const initCollectionIfNeeded = async (qdrant: QdrantClient) => {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === collectionName);

  if (!exists) {
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 4096,
        distance: "Cosine",
      },
      hnsw_config: {
        payload_m: 16,
        m: 0,
      },
      optimizers_config: {
        default_segment_number: 2,
      },
    });

    await qdrant.createPayloadIndex(collectionName, {
      field_name: "course_id",
      field_schema: {
        type: "keyword",
        is_tenant: true,
      },
    });

    console.log(`[Qdrant] Collection '${collectionName}' created.`);
  }
};

export const upsertChunksToQdrant = async ({
  courseId,
  embedManyResult,
}: {
  courseId: string;
  embedManyResult: EmbedManyResult<string>;
}) => {
  const qdrant = await getQdrantClient();

  const chunks = embedManyResult.values.map((text, i) => ({
    id: uuidv4(),
    text,
    embedding: embedManyResult.embeddings[i],
  }));

  const points = chunks.map((chunk) => ({
    id: chunk.id,
    vector: chunk.embedding,
    payload: {
      course_id: courseId,
      text: chunk.text,
    },
  }));

  await qdrant.upsert(collectionName, { points });
};
