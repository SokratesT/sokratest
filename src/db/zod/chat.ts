import { chat } from "@/db/schema/chat";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const chatInsertSchema = createInsertSchema(chat, {
  userId: (schema) => schema.optional(),
});

export const chatUpdateSchema = createUpdateSchema(chat, {
  userId: (schema) => schema.optional(),
  id: z.string(),
});

export const chatDeleteSchema = z.object({
  refs: z.array(chatUpdateSchema.pick({ id: true })),
});

export type ChatInsertSchemaType = z.infer<typeof chatInsertSchema>;
export type ChatUpdateSchemaType = z.infer<typeof chatUpdateSchema>;
export type ChatDeleteSchemaType = z.infer<typeof chatDeleteSchema>;
