import { SEMRESATTRS_PROJECT_NAME } from "@arizeai/openinference-semantic-conventions";
import {
  OpenInferenceSimpleSpanProcessor,
  isOpenInferenceSpan,
} from "@arizeai/openinference-vercel";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { registerOTel } from "@vercel/otel";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
// This is not required and should not be added in a production setting
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.NONE);

export function register() {
  registerOTel({
    serviceName: "sokratest",
    attributes: {
      // This is not required but it will allow you to send traces to a specific
      // project in phoenix
      [SEMRESATTRS_PROJECT_NAME]: "sokratest",
    },
    spanProcessors: [
      new OpenInferenceSimpleSpanProcessor({
        exporter: new OTLPTraceExporter({
          headers: {
            // API key if you're sending it to Phoenix
            api_key: "",
          },
          url: "http://localhost:6006/v1/traces",
        }),
        spanFilter: (span) => {
          // Only export spans that are OpenInference to remove non-generative spans
          // This should be removed if you want to export all spans
          return isOpenInferenceSpan(span);
        },
      }),
    ],
  });
}
