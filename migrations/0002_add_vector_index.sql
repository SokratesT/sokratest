CREATE INDEX data_embeddings_vector_idx ON data_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (
    m = 16,
    ef_construction = 64
  );