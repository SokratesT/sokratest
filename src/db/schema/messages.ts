import { type InferSelectModel, relations } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { chats } from "./chat";

// Using 'MessageDb' instead of 'Message' to avoid conflict with 'Message' from 'ai-sdk'

export const messagesDb = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MessageDb = InferSelectModel<typeof messagesDb>;

export const messagesRelations = relations(messagesDb, ({ one }) => ({
  chat: one(chats, {
    fields: [messagesDb.chatId],
    references: [chats.id],
  }),
}));
