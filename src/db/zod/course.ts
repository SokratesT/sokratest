import { course } from "@/db/schema/course";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const courseInsertSchema = createInsertSchema(course, {
  organizationId: (schema) => schema.optional(),
  description: (schema) =>
    schema.min(20, {
      message: "Description must be at least 20 characters long",
    }),
});

export const courseUpdateSchema = createUpdateSchema(course, {
  organizationId: (schema) => schema.optional(),
  id: z.string(),
});

export const courseDeleteSchema = z.object({
  refs: z.array(courseUpdateSchema.pick({ id: true })),
});

export type CourseInsertSchemaType = z.infer<typeof courseInsertSchema>;
export type CourseUpdateSchemaType = z.infer<typeof courseUpdateSchema>;
export type CourseDeleteSchemaType = z.infer<typeof courseDeleteSchema>;
