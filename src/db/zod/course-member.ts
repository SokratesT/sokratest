import { courseMember } from "@/db/schema/course";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const courseMemberInsertSchema = createInsertSchema(courseMember, {
  role: (schema) => schema.optional(),
});

export const courseMemberUpdateSchema = createUpdateSchema(courseMember, {
  courseId: z.string(),
  userId: z.string(),
});

export const courseMemberDeleteSchema = z.object({
  refs: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  courseId: z.string(),
});

export type CourseMemberInsertSchemaType = z.infer<
  typeof courseMemberInsertSchema
>;
export type CourseMemberUpdateSchemaType = z.infer<
  typeof courseMemberUpdateSchema
>;
export type CourseMemberDeleteSchemaType = z.infer<
  typeof courseMemberDeleteSchema
>;
