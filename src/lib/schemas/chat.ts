import { chats } from "@/db/schema/chat";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const chatInsertSchema = createInsertSchema(chats, {
  userId: (schema) => schema.optional(),
});

export const chatUpdateSchema = createUpdateSchema(chats, {
  userId: (schema) => schema.optional(),
  id: z.string(),
});

export const chatDeleteSchema = z.object({ ids: z.array(z.string()) });
