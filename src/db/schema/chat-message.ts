import { type InferSelectModel, relations } from "drizzle-orm";
import { json, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import type { ChatUIMessage } from "@/lib/ai/chat-message";
import { chat } from "./chat";

export const chatMessage = pgTable("chat_message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: varchar("role").$type<ChatUIMessage["role"]>().notNull(),
  parts: json("parts").$type<ChatUIMessage["parts"]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = InferSelectModel<typeof chatMessage>;

export const messagesRelations = relations(chatMessage, ({ one }) => ({
  chat: one(chat, {
    fields: [chatMessage.chatId],
    references: [chat.id],
  }),
}));
