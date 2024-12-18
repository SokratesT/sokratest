import { z } from "zod";

export const fileUploadSchema = z.object({
  bucket: z.string(),
  files: z.array(z.instanceof(File)),
});

export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;
