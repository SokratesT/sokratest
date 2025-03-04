import { z } from "zod";

export const courseSchema = z.object({
  title: z.string(),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" }),
  content: z.string(),
  organizationId: z.string(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
