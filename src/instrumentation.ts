import { OpenTelemetry } from "@ai-sdk/otel";
import { registerOTel } from "@vercel/otel";
import { registerTelemetry } from "ai";
import { LangfuseExporter } from "langfuse-vercel";

export function register() {
  registerTelemetry(new OpenTelemetry({ runtimeContext: true }));

  registerOTel({
    serviceName: "langfuse-sokratest-next-remote",
    traceExporter: new LangfuseExporter({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASEURL,
      environment: process.env.NODE_ENV,
    }),
  });
}
