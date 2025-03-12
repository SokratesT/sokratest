import { generateTitleFromUserMessage } from "@/actions/ai-actions";
import { saveChat, saveMessages } from "@/db/queries/ai-queries";
import { customModelWithTracing } from "@/lib/ai";
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/ai/utils";
import { auth } from "@/lib/auth";
import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { headers } from "next/headers";
import { getRelevantChunks } from "./ai-helper";

export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

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

  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
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

  const createSystemPrompt = (
    context: string,
  ) => `You are a Socratic tutor. Use the following principles in responding to students:

  - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
  - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
  - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
  - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
  - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
  - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.
  - Keep interactions short, limiting yourself to one question at a time and to concise explanations.

  In your response, ALWAYS include citations by referencing the fileId that certain information correspond to like this: <fileId:{fileId}>

  Below is the retrieved context:
  ${context}`;

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const relevantChunks = await getRelevantChunks(messages);

      relevantChunks.map((chunk) => dataStream.writeMessageAnnotation(chunk));

      const result = streamText({
        model: customModelWithTracing({
          model: {
            id: "deepseek-r1:14b",
            label: "Deepseek R1",
            apiIdentifier: "deepseek-r1:14b",
            description: "Local R1",
          },
          mode: "local",
          traceParams: {
            userId: session.user.id,
            messageId: userMessage.id,
            chatId: id,
            courseId: activeCourseId,
            organizationId: activeOrganizationId,
          },
        }),
        messages,
        experimental_transform: smoothStream(),
        experimental_telemetry: { isEnabled: true },
        // maxSteps: 1,
        // experimental_toolCallStreaming: true,
        /* system:
          "You are a helpful assistant. You can use tools to help the user.", */
        system: createSystemPrompt(
          JSON.stringify(
            relevantChunks.map((c) => ({ fileId: c.fileId, text: c.text })),
          ),
        ),
        // system: "You are a helpful assistant.",
        /* tools: {
          // generateFinalResponse: finalResponseTool(dataStream, messages),
          queryRag: queryRagTool(dataStream),
        }, */
        onStepFinish: ({ toolCalls, finishReason }) => {
          /* if (toolCalls?.some((call) => call.toolName === "queryRag")) {
            console.log("queryRag tool call finished");
          } */
          return;
        },
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                  annotations: relevantChunks,
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
