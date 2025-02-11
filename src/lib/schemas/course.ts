import { z } from "zod";

export const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  organizationId: z.string(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
