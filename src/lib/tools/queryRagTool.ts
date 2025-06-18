import { type DataStreamWriter, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "@/app/api/ai/chat/ai-helper";
import type { Course } from "@/db/schema/course";

export const queryRagTool = ({
  dataStream,
  courseId,
}: {
  dataStream: DataStreamWriter;
  courseId: Course["id"];
}) =>
  tool({
    description:
      "Use this tool to respond to questions. It will return some documents, which you should use to respond to the query.",
    parameters: z.object({
      query: z
        .string()
        .describe(
          "A detailed query to retrieve information about the user's latest question that takes the context of the current conversation into account.",
        ),
    }),
    execute: async ({ query }, { toolCallId }) => {
      dataStream.writeData({
        type: "id",
        content: toolCallId,
      });

      /* dataStream.writeData({
        type: "title",
        content: query,
      });

      dataStream.writeData({
        type: "kind",
        content: "text",
      });

      dataStream.writeData({
        type: "clear",
        content: "",
      }); */

      const result = await findRelevantContent({
        userQuery: query,
        courseId,
      });

      if (!result.success) {
        dataStream.writeData({
          type: "text-delta",
          content: `Error: ${result.error}`,
        });
        return;
      }

      if (!result.data.points || result.data.points.length === 0) {
        dataStream.writeData({
          type: "text-delta",
          content: "No relevant content found.",
        });
        return;
      }

      const points = result.data.points;

      points.forEach((point) => {
        dataStream.writeMessageAnnotation({
          text: point.payload.text,
          type: "reference",
        });
      });

      const cont = points.map((point) => ({
        fileId: point.payload.document_id,
        text: point.payload.text,
        similarity: point.score,
      }));

      /* return JSON.stringify(cont); */
      return JSON.stringify(cont);
    },
  });
