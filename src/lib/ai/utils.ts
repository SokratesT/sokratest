import type { ChatMessage } from "@/db/schema/chat-message";
import type { Attachment, Message, UIMessage } from "ai";

/* function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.parts) {
      const toolInvocations = message.parts.filter((part) => part.type === "tool-invocation");

      return {
        ...message,
        toolInvocations: toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
} */

export function convertToUIMessages(
  messages: Array<ChatMessage>,
): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    // Note: content will soon be deprecated in @ai-sdk/react
    content: "",
    annotations: message.annotations as UIMessage["annotations"],
    createdAt: message.createdAt,
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

/* export function sanitizeResponseMessages({
  messages,
  reasoning,
  annotations,
}: {
  messages: Array<ResponseMessage>;
  reasoning: string | undefined;
  annotations: JSONValue[] | undefined;
}) {
  const toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === "tool") {
      for (const content of message.content) {
        if (content.type === "tool-result") {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== "assistant") return message;

    if (typeof message.content === "string") return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === "tool-call"
        ? toolResultIds.includes(content.toolCallId)
        : content.type === "text"
          ? content.text.length > 0
          : true,
    );

    if (reasoning) {
      // @ts-expect-error: reasoning message parts in sdk is wip
      sanitizedContent.push({ type: "reasoning", reasoning });
    }

    if (annotations) {
      // @ts-expect-error: annotations message parts in sdk is wip
      sanitizedContent.push({ type: "annotations", annotations });
    }

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
} */

/* export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== "assistant") return message;

    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];

    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === "result") {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === "result" ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
} */

export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}
