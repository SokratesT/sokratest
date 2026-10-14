import { z } from "zod";

export const qdrantPlaygroundSearchSchema = z.object({
  search: z.string(),
});

export type QdrantPlaygroundSearchSchemaType = z.infer<
  typeof qdrantPlaygroundSearchSchema
>;
