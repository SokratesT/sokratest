import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

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
});

export type File = InferSelectModel<typeof files>;

export const document = pgTable("Document", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  kind: varchar("text", { enum: ["text", "code", "image"] })
    .notNull()
    .default("text"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable("Suggestion", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("documentId").notNull(),
  documentCreatedAt: timestamp("documentCreatedAt").notNull(),
  originalText: text("originalText").notNull(),
  suggestedText: text("suggestedText").notNull(),
  description: text("description"),
  isResolved: boolean("isResolved").notNull().default(false),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull(),
  // TODO: Remove dupliate reference to document
  documentRef: uuid("documentRef")
    .notNull()
    .references(() => document.id),
});

export type Suggestion = InferSelectModel<typeof suggestion>;
