import { document } from "@/db/schema/document";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
});

export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;

export const fileInsertSchema = createInsertSchema(document, {
  id: z.string(),
  courseId: z.string().optional(),
  uploadedBy: z.string().optional(),
  prefix: z.string().optional(),
  bucket: z.string().optional(),
});

export const fileUpdateSchema = createInsertSchema(document, {
  id: z.string(),
});

export const fileDeleteSchema = z.object({
  refs: z.array(fileUpdateSchema.pick({ id: true })),
});
