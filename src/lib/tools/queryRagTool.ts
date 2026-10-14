import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod/v4";
import {
  findRelevantContent,
  getDocumentReferencesByIds,
} from "@/app/api/ai/chat/ai-helper";
import type { Course } from "@/db/schema/course";
import type { ChatUIMessage } from "@/lib/ai/chat-message";

export const queryRagTool = ({
  writer,
  courseId,
}: {
  writer: UIMessageStreamWriter<ChatUIMessage>;
  courseId: Course["id"];
}) =>
  tool({
    description:
      "Use this tool to respond to questions. It will return some documents, which you should use to respond to the query.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "A detailed query to retrieve information about the user's latest question that takes the context of the current conversation into account.",
        ),
    }),
    execute: async ({ query }) => {
      const result = await findRelevantContent({
        userQuery: query,
        courseId,
      });

      if (!result.success) {
        return `Error: ${result.error}`;
      }

      if (!result.data.points || result.data.points.length === 0) {
        return "No relevant content found.";
      }

      const points = result.data.points;

      const references = await getDocumentReferencesByIds(
        points.map((point) => point.payload.document_id),
      );

      for (const reference of references) {
        writer.write({
          type: "data-reference",
          id: reference.id,
          data: reference,
        });
      }

      const cont = points.map((point) => ({
        fileId: point.payload.document_id,
        text: point.payload.text,
        similarity: point.score,
      }));

      return JSON.stringify(cont);
    },
  });
