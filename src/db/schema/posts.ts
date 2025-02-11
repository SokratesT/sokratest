import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: uuid("author")
    .notNull()
    .references(() => user.id),
  html: text("text").notNull(),
  /* json: json("json").notNull(), */
  createdAt: date("created_at").default("now()"),
  updatedAt: date("updated_at").default("now()"),
});

export type Post = InferSelectModel<typeof posts>;

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(user, {
    fields: [posts.author],
    references: [user.id],
  }),
}));
