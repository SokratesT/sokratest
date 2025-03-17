import { course } from "@/db/schema/course";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const courseSchema = z.object({
  title: z.string(),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" }),
  content: z.string(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;

export const courseInsertSchema = createInsertSchema(course, {
  organizationId: (schema) => schema.optional(),
});

export const courseUpdateSchema = createUpdateSchema(course, {
  organizationId: (schema) => schema.optional(),
  id: z.string(),
});

export const courseDeleteSchema = z.object({ ids: z.array(z.string()) });
