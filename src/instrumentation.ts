import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";

export function register() {
  registerOTel({
    serviceName: "langfuse-sokratest-next",
    traceExporter: new LangfuseExporter(),
  });
}
