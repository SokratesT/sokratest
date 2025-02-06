import type { InferSelectModel } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const embeddingStatusEnum = pgEnum("embedding_status", [
  "outstanding",
  "pending",
  "done",
  "failed",
]);

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  bucket: text("bucket").notNull(),
  filename: text("filename").notNull().unique(),
  originalName: text("original_name").notNull(),
  createdAt: date("created_at").default("now()"),
  size: integer("size").notNull(),
  fileType: text("file_type").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  embeddingStatus: embeddingStatusEnum().default("outstanding").notNull(),
});

export type File = InferSelectModel<typeof files>;
