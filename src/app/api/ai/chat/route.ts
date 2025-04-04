import { generateTitleFromUserMessage } from "@/db/actions/ai-actions";
import { saveChat, saveMessages } from "@/db/queries/ai-queries";
import { getSession } from "@/db/queries/auth";
import { getModel } from "@/lib/ai/models";
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/ai/utils";
import { createSocraticSystemPrompt } from "@/settings/prompts";
import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { v4 as uuidv4 } from "uuid";
import { getRelevantChunks } from "./ai-helper";

export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const activeCourseId = session.session.activeCourseId;
  const activeOrganizationId = session.session.activeOrganizationId;

  if (!activeCourseId) {
    return new Response("No active course", { status: 400 });
  }

  if (!activeOrganizationId) {
    return new Response("No active organization", { status: 400 });
  }

  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  if (!messages || messages.length === 1) {
    const res = await generateTitleFromUserMessage({
      message: userMessage.content,
    });
    const title = res?.data?.title;

    if (title) {
      await saveChat({
        id,
        userId: session.user.id,
        courseId: activeCourseId,
        title,
      });
    }
  }

  const aiMessageId = uuidv4();

  // TODO: Save user messages
  await saveMessages({
    messages: [
      {
        ...userMessage,
        createdAt: new Date(),
        updatedAt: new Date(),
        chatId: id,
      },
    ],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const relevantChunks = await getRelevantChunks(messages, activeCourseId);

      relevantChunks.map((chunk) =>
        // TODO: Handle this properly
        dataStream.writeMessageAnnotation(JSON.stringify(chunk)),
      );

      const result = streamText({
        model: getModel({
          type: "chat",
          traceParams: {
            userId: session.user.id,
            messageId: userMessage.id,
            chatId: id,
            courseId: activeCourseId,
            organizationId: activeOrganizationId,
          },
        }),
        messages,
        experimental_generateMessageId: () => aiMessageId,
        experimental_transform: smoothStream(),
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            langfuseTraceId: aiMessageId,
            sessionId: id,
          },
        },
        // maxSteps: 1,
        // experimental_toolCallStreaming: true,
        /* system:
          "You are a helpful assistant. You can use tools to help the user.", */
        system: createSocraticSystemPrompt(
          // TODO: Handle this properly
          { context: JSON.stringify(relevantChunks) },
        ),
        // system: "You are a helpful assistant.",
        /* tools: {
          // generateFinalResponse: finalResponseTool(dataStream, messages),
          queryRag: queryRagTool(dataStream),
        }, */
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                  annotations: [JSON.stringify(relevantChunks)],
                });

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                  },
                ),
              });
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream, { sendReasoning: true });
    },
  });
}
