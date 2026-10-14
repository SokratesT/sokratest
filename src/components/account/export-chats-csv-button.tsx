"use client";

import { Download, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getMessageText } from "@/lib/ai/chat-message";
import type { FilteredTrace } from "./export-chats";

type CSVRow = {
  session_id: string;
  trace_id: string;
  trace_timestamp: string;
  user_id: string;
  tags: string;
  latency: string;
  metadata_course_id: string;
  message_sequence: string;
  message_id: string;
  message_created_at: string;
  message_role: string;
  message_content: string;
  message_parts_text: string;
  message_parts_raw: string;
  is_output_message: string;
  score_id: string;
  score_name: string;
  score_value: string;
  score_timestamp: string;
  score_comment: string;
  observations: string;
};

type Score = FilteredTrace["scores"][number];

const sanitizeForCSV = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const str = typeof value === "string" ? value : String(value);
  return str
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/"/g, '""')
    .trim();
};

const escapeCSVField = (value: string): string => {
  const needsQuotes =
    /[",\n\r\t]/.test(value) || value !== value.replace(/\s+/g, " ");
  return needsQuotes ? `"${value}"` : value;
};

const getScoreValue = (score: Score) =>
  "stringValue" in score ? score.stringValue : score.value;

const emptyScore = {
  score_id: "",
  score_name: "",
  score_value: "",
  score_timestamp: "",
  score_comment: "",
};

/**
 * One user and one assistant row per chat turn (trace), grouped by chat and
 * ordered by time. The text comes from the trace input/output; ids and parts
 * come from the stored messages. Assistant rows repeat once per score.
 */
const convertToCSV = (traces: FilteredTrace[]): string => {
  const sessions = Map.groupBy(
    traces.toSorted(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    ),
    (trace) => trace.sessionId ?? "no-session",
  );

  const csvRows: CSVRow[] = [];

  for (const [sessionId, sessionTraces] of sessions) {
    let messageSequence = 0;

    for (const trace of sessionTraces) {
      const traceColumns = {
        session_id: sanitizeForCSV(sessionId),
        trace_id: sanitizeForCSV(trace.id),
        trace_timestamp: sanitizeForCSV(trace.timestamp),
        user_id: sanitizeForCSV(trace.userId),
        tags: sanitizeForCSV(trace.tags.join(";")),
        latency: sanitizeForCSV(trace.latency),
        metadata_course_id: sanitizeForCSV(trace.metadata?.courseId),
      };

      for (const role of ["user", "assistant"] as const) {
        const message = trace.messages.find((m) => m.role === role);
        const traceText = role === "user" ? trace.input : trace.output;
        const partsText = message ? getMessageText(message) : "";
        const isOutput = role === "assistant";

        messageSequence++;

        const messageColumns = {
          message_sequence: messageSequence.toString(),
          message_id: sanitizeForCSV(message?.id),
          message_created_at: sanitizeForCSV(message?.createdAt.toISOString()),
          message_role: role,
          message_content: sanitizeForCSV(
            typeof traceText === "string" ? traceText : partsText,
          ),
          message_parts_text: sanitizeForCSV(partsText),
          message_parts_raw: sanitizeForCSV(
            message ? JSON.stringify(message.parts) : "",
          ),
          is_output_message: isOutput ? "true" : "false",
        };

        const scoreColumns = (isOutput ? trace.scores : []).map((score) => ({
          score_id: sanitizeForCSV(score.id),
          score_name: sanitizeForCSV(score.name),
          score_value: sanitizeForCSV(getScoreValue(score)),
          score_timestamp: sanitizeForCSV(score.timestamp),
          score_comment: sanitizeForCSV(score.comment),
        }));

        for (const score of scoreColumns.length > 0
          ? scoreColumns
          : [emptyScore]) {
          csvRows.push({
            ...traceColumns,
            ...messageColumns,
            ...score,
            observations: sanitizeForCSV((trace.observations ?? []).join(";")),
          });
        }
      }
    }
  }

  // Convert to CSV format with proper escaping
  const headers = Object.keys(csvRows[0] || {}) as (keyof CSVRow)[];
  return [
    headers.join(","),
    ...csvRows.map((row) =>
      headers.map((header) => escapeCSVField(row[header])).join(","),
    ),
  ].join("\n");
};

const ExportChatsCSVButton = ({ traces }: { traces: FilteredTrace[] }) => {
  const handleExport = () => {
    try {
      // Convert traces to CSV
      const csvData = convertToCSV(traces);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-conversations-${new Date().toISOString().split("T")[0]}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success toast
      toast.success("Chat conversations exported to CSV successfully!", {
        description: "Check your downloads folder.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export chat conversations", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} className="gap-2">
        <Download className="size-4" />
        Export Chats (CSV)
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <Info className="size-4" />
            <span className="sr-only">CSV format information</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="space-y-3">
            <div>
              <h4 className="mb-2 font-semibold text-sm">CSV Export Format</h4>
              <p className="text-muted-foreground text-sm">
                The exported CSV contains conversation data structured for
                analysis and processing.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Key Features:</h5>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>
                  • <strong>Delimiter:</strong> Comma-separated values
                </li>
                <li>
                  • <strong>Encoding:</strong> UTF-8
                </li>
                <li>
                  • <strong>Grouping:</strong> Messages grouped by session
                </li>
                <li>
                  • <strong>Rows:</strong> One user and one assistant row per
                  message exchange
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Main Columns:</h5>
              <div className="space-y-1 text-muted-foreground text-sm">
                <div>
                  <code className="rounded bg-muted px-1">session_id</code> -
                  Conversation identifier
                </div>
                <div>
                  <code className="rounded bg-muted px-1">message_role</code> -
                  user/assistant/system
                </div>
                <div>
                  <code className="rounded bg-muted px-1">message_content</code>{" "}
                  - Text content
                </div>
                <div>
                  <code className="rounded bg-muted px-1">
                    message_sequence
                  </code>{" "}
                  - Order in conversation
                </div>
                <div>
                  <code className="rounded bg-muted px-1">trace_timestamp</code>{" "}
                  - When the message occurred
                </div>
              </div>
            </div>

            <div className="border-t pt-2">
              <p className="text-muted-foreground text-xs">
                Special characters are escaped and newlines converted to spaces
                for compatibility.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { ExportChatsCSVButton };
