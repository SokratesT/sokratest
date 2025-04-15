import { generateTitleFromUserMessage } from "@/db/actions/ai-actions";
import {
  getTrailingMessageId,
  saveChat,
  saveMessages,
} from "@/db/queries/ai-queries";
import { getSession } from "@/db/queries/auth";
import { getCourseConfig } from "@/db/queries/course";
import { getModel } from "@/lib/ai/models";
import { getMostRecentUserMessage } from "@/lib/ai/utils";
import { createSocraticSystemPrompt } from "@/settings/prompts";
import {
  type JSONValue,
  type Message,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { v4 as uuidv4 } from "uuid";
import { getDocumentReferencesByIds, getRelevantChunks } from "./ai-helper";

export const maxDuration = 200;

export async function POST(request: Request) {
  try {
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

    const result = await getCourseConfig(activeCourseId);

    if (!result.success) {
      return new Response(result.error.message, { status: 400 });
    }

    const courseConfig = result.data.query;

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

    const messageId = uuidv4();

    // TODO: Save user messages
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: "user",
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          annotations: userMessage.annotations ?? [],
          createdAt: new Date(),
        },
      ],
    });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const relevantChunks = await getRelevantChunks({
          messages,
          courseId: activeCourseId,
          limit: courseConfig.config.maxReferences ?? 5,
        });

        const references = await getDocumentReferencesByIds(
          relevantChunks.map((chunk) => chunk.documentId),
        );

        references.forEach((reference) => {
          dataStream.writeMessageAnnotation(reference as unknown as JSONValue);
        });

        const model = courseConfig.config.model as
          | "chat"
          | "chatReasoning"
          | "small"
          | "vision";

        const result = streamText({
          model: getModel({
            type: model.length > 0 ? model : "chat",
          }),
          system: createSocraticSystemPrompt(
            // TODO: Handle this properly
            {
              context: JSON.stringify(relevantChunks),
              override: courseConfig.config.systemPrompt,
            },
          ),
          messages,
          experimental_generateMessageId: () => messageId,
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              langfuseTraceId: messageId,
              sessionId: id,
            },
            functionId: "stream-text",
          },
          /* maxSteps: 5,
          toolCallStreaming: true,
          tools: {
            queryRag: queryRagTool({ dataStream, courseId: activeCourseId }),
          }, */
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === "assistant",
                  ),
                });

                if (!assistantId) {
                  throw new Error("No assistant message found!");
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      annotations: references ?? [],
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error) {
                console.error("Failed to save chat");
              }
            }
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, { sendReasoning: true });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 404,
    });
  }
}
