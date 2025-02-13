import type { InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const embeddingStatusEnum = pgEnum("embedding_status", [
  "outstanding",
  "processing",
  "done",
  "failed",
]);

export const fileRepository = pgTable("file_repository", {
  id: uuid("id").primaryKey().defaultRandom(),
  bucket: text("bucket").notNull(),
  prefix: text("prefix").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  // TODO: Should probably be an enum
  fileType: text("file_type").notNull(),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => user.id),
  embeddingStatus: embeddingStatusEnum().default("outstanding").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FileRepository = InferSelectModel<typeof fileRepository>;
