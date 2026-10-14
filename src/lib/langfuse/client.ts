import "server-only";

import { LangfuseClient } from "@langfuse/client";

/**
 * Langfuse API client for scores and trace queries. Reads
 * `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` and `LANGFUSE_BASE_URL`.
 */
export const langfuse = new LangfuseClient();
