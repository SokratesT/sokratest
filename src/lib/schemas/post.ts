import { post } from "@/db/schema/post";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const postSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type PostSchemaType = z.infer<typeof postSchema>;

export const postInsertSchema = createInsertSchema(post, {
  userId: (schema) => schema.optional(),
});

export const postUpdateSchema = createUpdateSchema(post, {
  userId: (schema) => schema.optional(),
  id: z.string(),
});

export const postDeleteSchema = z.object({ ids: z.array(z.string()) });
