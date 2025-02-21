import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { courses } from "./courses";
import { messagesDb } from "./messages";

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chats>;

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(user, {
    fields: [chats.userId],
    references: [user.id],
  }),
  messages: many(messagesDb),
}));
