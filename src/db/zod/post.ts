import { post } from "@/db/schema/post";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const postInsertSchema = createInsertSchema(post, {
  userId: (schema) => schema.optional(),
});

export const postUpdateSchema = createUpdateSchema(post, {
  userId: (schema) => schema.optional(),
  id: z.string(),
});

export const postDeleteSchema = z.object({
  refs: z.array(postUpdateSchema.pick({ id: true })),
});

export type PostInsertSchemaType = z.infer<typeof postInsertSchema>;
export type PostUpdateSchemaType = z.infer<typeof postUpdateSchema>;
export type PostDeleteSchemaType = z.infer<typeof postDeleteSchema>;
