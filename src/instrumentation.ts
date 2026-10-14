import { LangfuseSpanProcessor } from "@langfuse/otel";
import { LangfuseVercelAiSdkIntegration } from "@langfuse/vercel-ai-sdk";
import { registerOTel } from "@vercel/otel";
import { registerTelemetry } from "ai";
import { langfuseEnvironment } from "@/lib/langfuse/environment";

declare global {
  // Next.js bundles this file and the route handlers that import it as
  // separate modules, so the processor is kept once per process here
  var sokratestLangfuseSpanProcessor: LangfuseSpanProcessor | undefined;
}

/**
 * Exports spans to Langfuse. Reads `LANGFUSE_PUBLIC_KEY`,
 * `LANGFUSE_SECRET_KEY` and `LANGFUSE_BASE_URL`. Route handlers that trace
 * flush it with `after(() => langfuseSpanProcessor.forceFlush())`.
 */
globalThis.sokratestLangfuseSpanProcessor ??= new LangfuseSpanProcessor({
  environment: langfuseEnvironment,
});

export const langfuseSpanProcessor = globalThis.sokratestLangfuseSpanProcessor;

export function register() {
  registerOTel({
    serviceName: "langfuse-sokratest-next-remote",
    spanProcessors: [langfuseSpanProcessor],
  });

  registerTelemetry(new LangfuseVercelAiSdkIntegration());
}
