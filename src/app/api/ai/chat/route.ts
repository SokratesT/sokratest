import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  smoothStream,
  streamText,
  type ToolSet,
  toUIMessageStream,
} from "ai";
import { after } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveMessages } from "@/db/queries/ai-queries";
import { getSession } from "@/db/queries/auth";
import { getCourseConfig } from "@/db/queries/course";
import { langfuseSpanProcessor } from "@/instrumentation";
import {
  type ChatUIMessage,
  chatDataPartSchemas,
  getMessageText,
} from "@/lib/ai/chat-message";
import {
  getSaiaModel,
  type ModelsWithText,
  saiaModels,
} from "@/lib/ai/saia-models";
import { createNewChat, getMostRecentUserMessage } from "@/lib/ai/utils";
import { startTrace } from "@/lib/langfuse/trace";
import { createSocraticSystemPrompt } from "@/settings/prompts";
import { getDocumentReferencesByIds, getRelevantChunks } from "./ai-helper";

export const maxDuration = 200;

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const activeCourseId = session.session.activeCourseId;
    const activeOrganizationId = session.session.activeOrganizationId;

    if (!activeCourseId) {
      return new Response("No active course", { status: 400 });
    }

    if (!activeOrganizationId) {
      return new Response("No active organization", { status: 400 });
    }

    const {
      id: chatId,
      messages: requestMessages,
    }: { id: string; messages: unknown } = await request.json();

    const validatedMessages = await safeValidateUIMessages<ChatUIMessage>({
      messages: requestMessages,
      dataSchemas: chatDataPartSchemas,
    });

    if (!validatedMessages.success) {
      console.error("Invalid chat messages:", validatedMessages.error);
      return new Response("Invalid messages", { status: 400 });
    }

    const messages = validatedMessages.data;

    const result = await getCourseConfig(activeCourseId);

    if (!result.success) {
      return new Response(result.error.message, { status: 400 });
    }

    const courseConfig = result.data.query;

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    // Export the chat (and chat title) trace once the response has finished
    after(() => langfuseSpanProcessor.forceFlush());

    if (messages.length === 1) {
      createNewChat({
        message: getMessageText(userMessage),
        chatId,
        userId,
        courseId: activeCourseId,
      });
    }

    await saveMessages({
      messages: [
        {
          chatId,
          id: userMessage.id,
          role: "user",
          parts: userMessage.parts,
          createdAt: new Date(),
        },
      ],
    });

    const assistantMessageId = uuidv4();

    return await startTrace(
      {
        name: "chat",
        traceIdSeed: assistantMessageId,
        userId,
        sessionId: chatId,
        tags: ["user", "chat"],
        metadata: { courseId: activeCourseId },
        input: getMessageText(userMessage),
      },
      async (trace) => {
        const modelMessages = await convertToModelMessages(messages);

        const relevantChunks = await getRelevantChunks({
          messages: modelMessages,
          courseId: activeCourseId,
          limit: Number(courseConfig.config.maxReferences) ?? 5,
        });

        const references = await getDocumentReferencesByIds(
          relevantChunks.map((chunk) => chunk.documentId),
        );

        const stream = createUIMessageStream<ChatUIMessage>({
          originalMessages: messages,
          execute: ({ writer }) => {
            writer.write({ type: "start", messageId: assistantMessageId });

            for (const reference of references) {
              writer.write({
                type: "data-reference",
                id: reference.id,
                data: reference,
              });
            }

            // Validate and get the model ID from course configuration
            const modelIdFromConfig = courseConfig.config.model;
            const isValidModelId = saiaModels.some(
              (m) => m.id === modelIdFromConfig,
            );

            const { provider: modelProvider } = getSaiaModel({
              input: ["text"], // User only sends text
              model: isValidModelId
                ? (modelIdFromConfig as ModelsWithText)
                : "llama-3.3-70b-instruct",
            });

            const streamResult = streamText({
              model: modelProvider,
              instructions: createSocraticSystemPrompt({
                context: relevantChunks.map((chunk) => ({
                  documentId: String(
                    references.findIndex((r) => r.id === chunk.documentId) + 1,
                  ),
                  text: chunk.text,
                })),
                courseTitle: courseConfig.title,
                override: courseConfig.config.systemPrompt,
              }),
              messages: modelMessages,
              experimental_transform: smoothStream({ chunking: "word" }),
              telemetry: { functionId: "chat" },
              // Tools are not working with some SAIA models
              /* stopWhen: isStepCount(5),
              tools: {
                queryRag: queryRagTool({ writer, courseId: activeCourseId }),
              }, */
            });

            writer.merge(
              toUIMessageStream<ToolSet, ChatUIMessage>({
                stream: streamResult.stream,
                sendReasoning: true,
                sendStart: false,
              }),
            );
          },
          onEnd: async ({ responseMessage }) => {
            trace.end({ output: getMessageText(responseMessage) });

            try {
              await saveMessages({
                messages: [
                  {
                    id: responseMessage.id,
                    chatId,
                    role: responseMessage.role,
                    parts: responseMessage.parts,
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (error) {
              console.error("Error saving assistant message:", error);
            }
          },
          onError: (error) => {
            trace.end({ error });
            console.error("Error in UI message stream execution:", error);
            return "Oops, an error occurred while processing your request!";
          },
        });

        return createUIMessageStreamResponse({
          stream,
          consumeSseStream: consumeStream,
        });
      },
    );
  } catch (error) {
    console.error("Error in POST /api/ai/chat:", error);
    return new Response("An error occurred while processing your request!", {
      status: 404,
    });
  }
}
