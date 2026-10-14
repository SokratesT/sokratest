import {
  createTraceId,
  propagateAttributes,
  startActiveObservation,
} from "@langfuse/tracing";
import { TraceFlags } from "@opentelemetry/api";

/**
 * Placeholder parent span id. OpenTelemetry derives the trace id from the
 * parent span context, so a trace with a given id needs one. Langfuse shows
 * observations whose parent does not exist at the top of the trace.
 */
const ROOT_PARENT_SPAN_ID = "0123456789abcdef";

type TraceOptions = {
  /** Trace name, e.g. `chat` */
  name: string;
  /**
   * Seed for a deterministic trace id (`createTraceId(seed)`). Without a seed
   * the trace gets a random id.
   */
  traceIdSeed?: string;
  userId: string;
  sessionId: string;
  tags: string[];
  metadata?: Record<string, string>;
  /** Trace input, e.g. the user message text */
  input: string;
};

type TraceResult = { output: string } | { error: unknown };

export type Trace = {
  /** Ends the trace. Only the first call has an effect. */
  end: (result: TraceResult) => void;
};

/**
 * Runs `fn` inside a new Langfuse trace. User, session, tags and metadata are
 * propagated to every span started within `fn`, including the AI SDK ones.
 *
 * The root observation stays open until `trace.end` is called, so a streamed
 * response can end it when the stream finishes. If `fn` throws, the trace is
 * ended with the error.
 */
export const startTrace = async <T>(
  { name, traceIdSeed, userId, sessionId, tags, metadata, input }: TraceOptions,
  fn: (trace: Trace) => Promise<T>,
): Promise<T> => {
  const traceId = await createTraceId(traceIdSeed);

  return startActiveObservation(
    name,
    async (observation) => {
      let ended = false;

      const trace: Trace = {
        end: (result) => {
          if (ended) {
            return;
          }
          ended = true;

          if ("error" in result) {
            observation.update({
              level: "ERROR",
              statusMessage:
                result.error instanceof Error
                  ? result.error.message
                  : String(result.error),
            });
          } else {
            observation.update({ output: result.output });
            observation.setTraceIO({ output: result.output });
          }

          observation.end();
        },
      };

      // The root observation has a (placeholder) parent, so Langfuse 3 does
      // not copy its input/output to the trace; set the trace IO explicitly.
      observation.update({ input });
      observation.setTraceIO({ input });

      try {
        return await propagateAttributes(
          { traceName: name, userId, sessionId, tags, metadata },
          () => fn(trace),
        );
      } catch (error) {
        trace.end({ error });
        throw error;
      }
    },
    {
      parentSpanContext: {
        traceId,
        spanId: ROOT_PARENT_SPAN_ID,
        traceFlags: TraceFlags.SAMPLED,
      },
      endOnExit: false,
    },
  );
};
