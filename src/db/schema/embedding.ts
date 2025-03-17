import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { document } from "./document";

export const embedding = pgTable(
  "embedding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileId: uuid("file_id")
      .references(() => document.id, { onDelete: "cascade" })
      .notNull(),
    vector: vector("vector", { dimensions: 1024 }).notNull(),
    text: text("text").notNull(), // The text chunk this embedding represents
    // startChar: integer("start_char").notNull(), // Position tracking
    // endChar: integer("end_char").notNull(),
    nodeId: text("node_id").notNull(),
    metadata: json("metadata").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("data_embedding_vector_idx")
      .using("hnsw", table.vector.op("vector_cosine_ops"))
      .with({ m: "16", ef_construction: "64" }),
  ],
);
