import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { messagesDb } from "./messages";

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: text("message_id")
    .notNull()
    .references(() => messagesDb.id, { onDelete: "cascade" })
    .unique(),
  sentiment: smallint("sentiment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Vote = InferSelectModel<typeof votes>;

export const messagesRelations = relations(votes, ({ one }) => ({
  message: one(messagesDb, {
    fields: [votes.messageId],
    references: [messagesDb.id],
  }),
}));
