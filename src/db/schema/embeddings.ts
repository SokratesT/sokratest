import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { files } from "./files";

export const embeddings = pgTable("data_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id")
    .references(() => files.id, { onDelete: "cascade" })
    .notNull(),
  embedding: vector("embedding", { dimensions: 1024 }),
  text: text("text").notNull(), // The text chunk this embedding represents
  // startChar: integer("start_char").notNull(), // Position tracking
  // endChar: integer("end_char").notNull(),
  nodeId: text("node_id").notNull(),
  metadata: json("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
