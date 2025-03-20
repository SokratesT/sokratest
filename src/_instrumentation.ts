import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";
import type { Instrumentation } from "next";
import { posthog } from "posthog-js";

export function register() {
  registerOTel({
    serviceName: "langfuse-sokratest-next",
    traceExporter: new LangfuseExporter(),
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error) => {
  posthog.captureException(error);
};
