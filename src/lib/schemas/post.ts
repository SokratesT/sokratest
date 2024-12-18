import { z } from "zod";

export const postSchema = z.object({
  title: z.string(),
  html: z.string(),
  /* json: z.string().transform((str) => {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }), */
});

export type PostSchemaType = z.infer<typeof postSchema>;
