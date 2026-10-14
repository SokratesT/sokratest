import type { UIMessage } from "ai";
import { z } from "zod";

// Document metadata snapshot of a reference. Legacy references (persisted as
// message annotations) can lack fields or contain nulls, so all are nullish.
const chatReferenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  metadata: z.object({
    showReference: z.boolean().nullish(),
    relevance: z.enum(["high", "medium", "low"]).nullish(),
    citation: z.string().nullish(),
    externalUrl: z.string().nullish(),
    pageRange: z.string().nullish(),
    author: z.string().nullish(),
    chapterTitle: z.string().nullish(),
    mergePages: z.boolean().nullish(),
  }),
});

const toolStreamSchema = z.object({ text: z.string() });

export const chatDataPartSchemas = {
  reference: chatReferenceSchema,
  toolStream: toolStreamSchema,
};

export type ChatReference = z.infer<typeof chatReferenceSchema>;

export type ChatDataParts = {
  reference: ChatReference;
  toolStream: z.infer<typeof toolStreamSchema>;
};

export type ChatUIMessage = UIMessage<unknown, ChatDataParts>;

export const getMessageText = (message: Pick<ChatUIMessage, "parts">) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
