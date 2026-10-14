type TelemetryMetadata = {
  langfuseTraceId?: string;
  sessionId: string;
  courseId: string;
  userId: string;
  tags: string[];
};

/**
 * Passes the trace metadata as runtime context and includes all of it in the
 * telemetry spans (`ai.settings.context.*`).
 */
export const withTelemetryMetadata = (metadata: TelemetryMetadata) => ({
  runtimeContext: metadata,
  telemetry: {
    includeRuntimeContext: {
      langfuseTraceId: true,
      sessionId: true,
      courseId: true,
      userId: true,
      tags: true,
    },
  },
});
