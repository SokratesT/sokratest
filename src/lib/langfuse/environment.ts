/**
 * Langfuse environment for traces and scores. `LANGFUSE_TRACING_ENVIRONMENT`
 * takes precedence; otherwise the Node environment (`development`,
 * `production`) is used, as with the previous SDK.
 */
export const langfuseEnvironment =
  process.env.LANGFUSE_TRACING_ENVIRONMENT || process.env.NODE_ENV;
