import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";
import type { Instrumentation } from "next";
import { posthog } from "posthog-js";

export function register() {
  registerOTel({
    serviceName: "langfuse-sokratest-next-remote",
    traceExporter: new LangfuseExporter({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASEURL,
    }),
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error) => {
  posthog.captureException(error);
};
