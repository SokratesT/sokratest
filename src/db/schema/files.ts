import { sql } from "drizzle-orm";
import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bucket: text("bucket").notNull(),
  filename: text("filename").notNull().unique(),
  originalName: text("original_name").notNull(),
  createdAt: date("created_at").default("now()"),
  size: integer("size").notNull(),
  fileType: text("file_type").notNull(),
});
