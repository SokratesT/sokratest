// Basically just the types used by qdrant, but they aren't exported properly

export interface QdrantChunk {
  points: {
    id: string | number;
    version: number;
    score: number;
    payload: ChunkPayload;
    vector?:
      | Record<string, unknown>
      | number[]
      | number[][]
      | {
          [key: string]:
            | number[]
            | number[][]
            | {
                indices: number[];
                values: number[];
              }
            | undefined;
        }
      | null
      | undefined;
    shard_key?: string | number | Record<string, unknown> | null | undefined;
    order_value?: number | Record<string, unknown> | null | undefined;
  }[];
}

export type ChunkPayload = {
  course_id: string;
  document_id: string;
  text: string;
  title: string;
  depth: number;
  tokens: number;
  chunkIndex: number;
  chunkCount: number;
  createdAt: string;
};
