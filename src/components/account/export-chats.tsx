import type { GetScoresResponseData, TraceWithDetails } from "@langfuse/core";
import { createTraceId } from "@langfuse/tracing";
import { getMessagesByUserChatIds } from "@/db/queries/ai-queries";
import { getSession } from "@/db/queries/auth";
import type { ChatMessage } from "@/db/schema/chat-message";
import { langfuse } from "@/lib/langfuse/client";
import { ExportChatsButton } from "./export-chats-button";
import { ExportChatsCSVButton } from "./export-chats-csv-button";

/**
 * One chat turn. `input` is the user message text and `output` the assistant
 * message text, as recorded on the trace.
 */
export type FilteredTrace = Pick<
  TraceWithDetails,
  | "id"
  | "input"
  | "output"
  | "sessionId"
  | "timestamp"
  | "metadata"
  | "userId"
  | "tags"
  | "latency"
  | "observations"
> & {
  scores: GetScoresResponseData[];
  /** The stored user and assistant message of the turn, if the chat exists */
  messages: Pick<ChatMessage, "id" | "role" | "parts" | "createdAt">[];
};

const PAGE_SIZE = 50;

const fetchAllTraces = async (userId: string) => {
  const traces: TraceWithDetails[] = [];

  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const response = await langfuse.api.trace.list({
      userId,
      tags: "user",
      limit: PAGE_SIZE,
      page,
    });
    traces.push(...response.data);
    totalPages = response.meta.totalPages;
  }

  return traces;
};

const fetchAllScores = async (userId: string) => {
  const scores: GetScoresResponseData[] = [];

  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const response = await langfuse.api.scores.getMany({
      userId,
      limit: PAGE_SIZE,
      page,
    });
    scores.push(...response.data);
    totalPages = response.meta.totalPages;
  }

  return scores;
};

/**
 * Maps trace ids to the stored user and assistant message of the turn. The
 * chat trace id is derived from the assistant message id; traces recorded
 * before the Langfuse SDK v5 migration used the message id itself.
 */
const getTurnMessagesByTraceId = async (
  messages: Awaited<ReturnType<typeof getMessagesByUserChatIds>>,
) => {
  const turnMessages = new Map<string, FilteredTrace["messages"]>();

  for (const [index, message] of messages.entries()) {
    if (message.role !== "assistant") {
      continue;
    }

    const previous = messages[index - 1];
    const turn = [
      ...(previous?.chatId === message.chatId && previous.role === "user"
        ? [previous]
        : []),
      message,
    ].map(({ id, role, parts, createdAt }) => ({ id, role, parts, createdAt }));

    turnMessages.set(await createTraceId(message.id), turn);
    turnMessages.set(message.id, turn);
  }

  return turnMessages;
};

const fetchChatTurns = async (userId: string): Promise<FilteredTrace[]> => {
  const [traces, scores] = await Promise.all([
    fetchAllTraces(userId),
    fetchAllScores(userId),
  ]);

  const chatIds = [
    ...new Set(traces.flatMap((trace) => trace.sessionId ?? [])),
  ];
  const turnMessages = await getTurnMessagesByTraceId(
    await getMessagesByUserChatIds({ userId, chatIds }),
  );

  return traces.map((trace) => ({
    id: trace.id,
    input: trace.input,
    output: trace.output,
    sessionId: trace.sessionId,
    timestamp: trace.timestamp,
    metadata: trace.metadata,
    userId: trace.userId,
    tags: trace.tags,
    latency: trace.latency,
    observations: trace.observations,
    scores: scores.filter((score) => score.traceId === trace.id),
    messages: turnMessages.get(trace.id) ?? [],
  }));
};

const calculateOverviewStats = (traces: FilteredTrace[]) => {
  const totalMessages = traces.length;

  // Count unique sessions (individual chats)
  const uniqueSessions = new Set(
    traces.map((trace) => trace.sessionId).filter(Boolean),
  ).size;

  // Calculate date range
  const timestamps = traces
    .map((trace) => new Date(trace.timestamp))
    .filter((date) => !Number.isNaN(date.getTime()));
  const earliestDate =
    timestamps.length > 0
      ? new Date(Math.min(...timestamps.map((d) => d.getTime())))
      : null;
  const latestDate =
    timestamps.length > 0
      ? new Date(Math.max(...timestamps.map((d) => d.getTime())))
      : null;

  // Count traces with scores
  const tracesWithScores = traces.filter(
    (trace) => trace.scores && trace.scores.length > 0,
  ).length;

  // Calculate average latency (excluding null/undefined values)
  const latencies = traces
    .flatMap((trace) => trace.latency ?? [])
    .filter((latency) => latency > 0);
  const averageLatency =
    latencies.length > 0
      ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
      : 0;

  // Count different tags
  const allTags = traces.flatMap((trace) => trace.tags || []);
  const uniqueTags = new Set(allTags);

  return {
    totalMessages,
    uniqueSessions,
    dateRange: {
      earliest: earliestDate,
      latest: latestDate,
    },
    tracesWithScores,
    averageLatency: Math.round(averageLatency),
    uniqueTags: Array.from(uniqueTags),
  };
};

const ExportChats = async () => {
  const session = await getSession();

  if (!session) {
    return <div>Please log in to export chats.</div>;
  }

  const traces = await fetchChatTurns(session.user.id);
  const stats = calculateOverviewStats(traces);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div className="space-y-1">
          <p className="font-bold text-xl">
            {stats.totalMessages.toLocaleString()}
          </p>
          <p className="text-muted-foreground">Total Messages</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-xl">
            {stats.uniqueSessions.toLocaleString()}
          </p>
          <p className="text-muted-foreground">Individual Chats</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-xl">
            {stats.averageLatency > 0 ? `${stats.averageLatency}s` : "N/A"}
          </p>
          <p className="text-muted-foreground">Avg Response Time</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-xl">
            {stats.tracesWithScores.toLocaleString()}
          </p>
          <p className="text-muted-foreground">With Scores</p>
        </div>
      </div>

      {stats.dateRange.earliest && stats.dateRange.latest && (
        <div className="mt-4 border-border border-t pt-4">
          <p className="text-muted-foreground text-sm">
            Data from {stats.dateRange.earliest.toLocaleDateString()} to{" "}
            {stats.dateRange.latest.toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ExportChatsButton traces={traces} />
        <ExportChatsCSVButton traces={traces} />
      </div>
    </div>
  );
};

export { ExportChats };
