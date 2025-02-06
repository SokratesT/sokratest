import { type InferSelectModel, relations } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }),
  user: text("user")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chats>;

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chat: uuid("chat")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof messages>;

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(user, {
    fields: [chats.user],
    references: [user.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chat],
    references: [chats.id],
  }),
}));
