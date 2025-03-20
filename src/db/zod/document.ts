import { document } from "@/db/schema/document";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fileUploadSchema = z.object({
  bucket: z.string(),
  files: z.array(z.instanceof(File)),
});

export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;

export const fileInsertSchema = createInsertSchema(document, {
  id: z.string(),
  courseId: z.string().optional(),
  uploadedBy: z.string().optional(),
  prefix: z.string().optional(),
});

export const fileDeleteSchema = z.object({ ids: z.array(z.string()) });
