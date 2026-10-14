/// <reference types="bun" />

import { afterAll, beforeAll, expect, test } from "bun:test";
import { createTraceId } from "@langfuse/tracing";
import {
  createUIMessageStream,
  streamText,
  type ToolSet,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  convertArrayToReadableStream,
  convertReadableStreamToArray,
  MockLanguageModelV3,
} from "ai/test";
import { z } from "zod";
import { startTrace } from "./trace";

// Subset of the OTLP/HTTP JSON trace export request
const otlpValueSchema = z.object({
  stringValue: z.string().optional(),
  boolValue: z.boolean().optional(),
  arrayValue: z
    .object({ values: z.array(z.object({ stringValue: z.string() })) })
    .optional(),
});

const otlpRequestSchema = z.object({
  resourceSpans: z.array(
    z.object({
      scopeSpans: z.array(
        z.object({
          scope: z.object({ name: z.string() }),
          spans: z.array(
            z.object({
              traceId: z.string(),
              spanId: z.string(),
              parentSpanId: z.string().optional(),
              name: z.string(),
              attributes: z.array(
                z.object({ key: z.string(), value: otlpValueSchema }),
              ),
            }),
          ),
        }),
      ),
    }),
  ),
});

type ExportedSpan = {
  scope: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  attributes: Map<string, z.infer<typeof otlpValueSchema>>;
};

const exportedSpans: ExportedSpan[] = [];
const authorizationHeaders: (string | null)[] = [];

let server: Bun.Server<undefined>;
let langfuseSpanProcessor: typeof import("@/instrumentation")["langfuseSpanProcessor"];

beforeAll(async () => {
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: async (request) => {
      const { pathname } = new URL(request.url);

      if (
        request.method !== "POST" ||
        pathname !== "/api/public/otel/v1/traces"
      ) {
        return new Response("Not found", { status: 404 });
      }

      authorizationHeaders.push(request.headers.get("authorization"));

      const body = otlpRequestSchema.parse(await request.json());
      for (const { scopeSpans } of body.resourceSpans) {
        for (const { scope, spans } of scopeSpans) {
          for (const span of spans) {
            exportedSpans.push({
              ...span,
              scope: scope.name,
              attributes: new Map(
                span.attributes.map(({ key, value }) => [key, value]),
              ),
            });
          }
        }
      }

      return Response.json({});
    },
  });

  process.env.LANGFUSE_PUBLIC_KEY = "pk-lf-test";
  process.env.LANGFUSE_SECRET_KEY = "sk-lf-test";
  process.env.LANGFUSE_BASE_URL = server.url.origin;

  // Same setup as the Next.js app: OTel with the Langfuse span processor and
  // the Langfuse AI SDK telemetry integration
  const instrumentation = await import("@/instrumentation");
  instrumentation.register();
  langfuseSpanProcessor = instrumentation.langfuseSpanProcessor;
});

afterAll(async () => {
  await langfuseSpanProcessor.shutdown();
  await server.stop();
});

const stringAttribute = (span: ExportedSpan | undefined, key: string) =>
  span?.attributes.get(key)?.stringValue;

const arrayAttribute = (span: ExportedSpan, key: string) =>
  span.attributes.get(key)?.arrayValue?.values.map((v) => v.stringValue);

test("traces a streamed chat turn with the trace id derived from the message id", async () => {
  const messageId = "1b3f7a2e-4c5d-4e6f-8a9b-0c1d2e3f4a5b";
  const userId = "user-1";
  const chatId = "chat-1";
  const courseId = "course-1";

  const model = new MockLanguageModelV3({
    provider: "mock-provider",
    modelId: "mock-model",
    doStream: {
      stream: convertArrayToReadableStream([
        { type: "stream-start", warnings: [] },
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: "Why do you " },
        { type: "text-delta", id: "text-1", delta: "think so?" },
        { type: "text-end", id: "text-1" },
        {
          type: "finish",
          finishReason: { unified: "stop", raw: "stop" },
          usage: {
            inputTokens: {
              total: 12,
              noCache: 12,
              cacheRead: undefined,
              cacheWrite: undefined,
            },
            outputTokens: { total: 4, text: 4, reasoning: undefined },
          },
        },
      ]),
    },
  });

  // Same shape as the chat route: the handler returns a stream, and the
  // trace ends when the stream ends
  const stream = await startTrace(
    {
      name: "chat",
      traceIdSeed: messageId,
      userId,
      sessionId: chatId,
      tags: ["user", "chat"],
      metadata: { courseId },
      input: "Is the earth flat?",
    },
    async (trace) =>
      createUIMessageStream<UIMessage>({
        execute: ({ writer }) => {
          writer.write({ type: "start", messageId });

          const result = streamText({
            model,
            prompt: "Is the earth flat?",
            telemetry: { functionId: "chat" },
          });

          writer.merge(
            toUIMessageStream<ToolSet, UIMessage>({
              stream: result.stream,
              sendStart: false,
            }),
          );
        },
        onEnd: ({ responseMessage }) => {
          trace.end({
            output: responseMessage.parts
              .flatMap((part) => (part.type === "text" ? part.text : []))
              .join(""),
          });
        },
      }),
  );

  await langfuseSpanProcessor.forceFlush();
  expect(exportedSpans.some((span) => span.name === "chat")).toBe(false);

  await convertReadableStreamToArray(stream);
  await langfuseSpanProcessor.forceFlush();

  const expectedTraceId = await createTraceId(messageId);
  const traceSpans = exportedSpans.filter(
    (span) => span.traceId === expectedTraceId,
  );

  expect(authorizationHeaders.length).toBeGreaterThan(0);
  expect(new Set(authorizationHeaders)).toEqual(
    new Set([`Basic ${btoa("pk-lf-test:sk-lf-test")}`]),
  );
  expect(traceSpans.length).toBeGreaterThan(1);
  expect(traceSpans).toHaveLength(exportedSpans.length);

  for (const span of traceSpans) {
    expect(stringAttribute(span, "user.id")).toBe(userId);
    expect(stringAttribute(span, "session.id")).toBe(chatId);
    expect(stringAttribute(span, "langfuse.trace.name")).toBe("chat");
    expect(arrayAttribute(span, "langfuse.trace.tags")).toEqual([
      "user",
      "chat",
    ]);
    expect(stringAttribute(span, "langfuse.trace.metadata.courseId")).toBe(
      courseId,
    );
    expect(stringAttribute(span, "langfuse.environment")).toBe("test");
  }

  const root = traceSpans.find((span) => span.name === "chat");
  expect(root?.scope).toBe("langfuse-sdk");
  expect(stringAttribute(root, "langfuse.trace.input")).toBe(
    "Is the earth flat?",
  );
  expect(stringAttribute(root, "langfuse.trace.output")).toBe(
    "Why do you think so?",
  );

  // AI SDK spans from the Langfuse integration, nested under the root
  const aiSdkSpans = traceSpans.filter((span) => span.scope === "gen_ai");
  expect(aiSdkSpans.some((span) => span.parentSpanId === root?.spanId)).toBe(
    true,
  );

  const generation = aiSdkSpans.find(
    (span) => stringAttribute(span, "gen_ai.operation.name") === "chat",
  );
  expect(generation).toBeDefined();
  expect(stringAttribute(generation, "gen_ai.request.model")).toBe(
    "mock-model",
  );
  expect(stringAttribute(generation, "gen_ai.output.messages")).toContain(
    "Why do you think so?",
  );
});
