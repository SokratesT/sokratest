import { document } from "@/db/schema/document";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
});

export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;

export const documentInsertSchema = createInsertSchema(document, {
  id: z.string(),
  courseId: (schema) => schema.optional(),
  uploadedBy: (schema) => schema.optional(),
  prefix: (schema) => schema.optional(),
  bucket: (schema) => schema.optional(),
  metadata: (schema) => schema.optional(),
});

export const documentUpdateSchema = createUpdateSchema(document, {
  id: z.string(),
});

export const documentDeleteSchema = z.object({
  refs: z.array(documentUpdateSchema.pick({ id: true })),
});

export type DocumentInsertSchemaType = z.infer<typeof documentInsertSchema>;
export type DocumentUpdateSchemaType = z.infer<typeof documentUpdateSchema>;
export type DocumentDeleteSchemaType = z.infer<typeof documentDeleteSchema>;
