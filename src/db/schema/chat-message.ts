import { type InferSelectModel, relations } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { chat } from "./chat";

// Using 'MessageDb' instead of 'Message' to avoid conflict with 'Message' from 'ai-sdk'

export const chatMessage = pgTable("chat_message", {
  id: text("id").primaryKey(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatMessage = InferSelectModel<typeof chatMessage>;

export const messagesRelations = relations(chatMessage, ({ one }) => ({
  chat: one(chat, {
    fields: [chatMessage.chatId],
    references: [chat.id],
  }),
}));
