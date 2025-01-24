-- Custom SQL migration file, put your code below! --

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "data_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"embedding" vector(1024),
	"text" text NOT NULL,
	"node_id" text NOT NULL,
	"metadata" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX data_embeddings_vector_idx ON data_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (
    m = 16,
    ef_construction = 64
  );