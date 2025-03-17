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
  ids: z.array(z.string()),
  courseId: z.string(),
});
