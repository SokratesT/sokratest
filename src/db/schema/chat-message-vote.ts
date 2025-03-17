import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { chatMessage } from "./chat-message";

export const chatMessageVote = pgTable("chat_message_vote", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: text("message_id")
    .notNull()
    .references(() => chatMessage.id, { onDelete: "cascade" })
    .unique(),
  sentiment: smallint("sentiment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatMessageVote = InferSelectModel<typeof chatMessageVote>;

export const messagesRelations = relations(chatMessageVote, ({ one }) => ({
  message: one(chatMessage, {
    fields: [chatMessageVote.messageId],
    references: [chatMessage.id],
  }),
}));
