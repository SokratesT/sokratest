import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("text").notNull(),
  // TODO: Check what should be done if user deletes account
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Post = InferSelectModel<typeof posts>;

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(user, {
    fields: [posts.userId],
    references: [user.id],
  }),
}));
