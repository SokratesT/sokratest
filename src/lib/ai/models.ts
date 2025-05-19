import { createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModelV1 } from "@ai-sdk/provider";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";
import type { LanguageModelV1 } from "ai";

// TODO: Migrate to `customProvider` of vercel ai sdk

// Define interfaces for different model types
interface BaseModel {
  id: string;
  label: string;
  description: string;
}

interface ChatModel extends BaseModel {
  type: "chatReasoning" | "chat" | "small" | "vision";
  getProvider: () => LanguageModelV1;
}

interface EmbeddingModel extends BaseModel {
  type: "embedding";
  getProvider: () => EmbeddingModelV1<string>;
}

type Model = ChatModel | EmbeddingModel;

const remoteProvider = createOpenAI({
  baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL,
  apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
  name: "chatAi",
  compatibility: "compatible",
});

const localProvider = createOpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
  name: "ollama",
  compatibility: "compatible",
});

const models = {
  remote: {
    chatReasoning: {
      id: "deepseek-r1-distill-llama-70b",
      label: "Deepseek R1 (70b)",
      description: "Model description for Deepseek R1",
      type: "chatReasoning" as const,
      getProvider: function () {
        return wrapLanguageModel({
          model: remoteProvider(this.id),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        });
      },
    },
    chat: {
      id: "llama-3.3-70b-instruct",
      label: "Llama 3.3 (70b)",
      description: "Model description for 3.3 70b",
      type: "chat" as const,
      getProvider: function () {
        return remoteProvider(this.id);
      },
    },
    small: {
      id: "meta-llama-3.1-8b-instruct",
      label: "Llama 3.1 (8b)",
      description: "Model description for 3.1 8b",
      type: "small" as const,
      getProvider: function () {
        return remoteProvider(this.id);
      },
    },
    vision: {
      id: "llama-4-scout-17b-16e-instruct",
      label: "Llama 4 Scout (17b)",
      description: "Model description for Llama 4 Scout (17b)",
      type: "vision" as const,
      getProvider: function () {
        return remoteProvider(this.id);
      },
    },
    embedding: {
      id: "e5-mistral-7b-instruct",
      label: "E5 Mistral 7b",
      description: "Model description for E5 Mistral 7b",
      type: "embedding" as const,
      getProvider: function () {
        return remoteProvider.embedding(this.id);
      },
    },
  },
  local: {
    chatReasoning: {
      id: "deepseek-r1:14b",
      label: "Deepseek R1",
      description: "Model description for Deepseek R1",
      type: "chatReasoning" as const,
      getProvider: function () {
        return wrapLanguageModel({
          model: localProvider(this.id),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        });
      },
    },
    chat: {
      id: "llama3.1",
      label: "Llama 3.1",
      description: "Local Llama",
      type: "chat" as const,
      getProvider: function () {
        return localProvider(this.id);
      },
    },
    small: {
      id: "llama3.1",
      label: "Llama 3.1",
      description: "Local Llama",
      type: "small" as const,
      getProvider: function () {
        return localProvider(this.id);
      },
    },
    vision: {
      id: "llama3.2-vision:11b",
      label: "Llama 3.2 (11b)",
      description: "Model description for Llama 3.2 (11b)",
      type: "vision" as const,
      getProvider: function () {
        return remoteProvider(this.id);
      },
    },
    embedding: {
      id: "mxbai-embed-large:latest",
      label: "Mxbai Embed Large",
      description: "Model description for Mxbai Embed Large",
      type: "embedding" as const,
      getProvider: function () {
        return localProvider.embedding(this.id);
      },
    },
  },
};

export const getModel = <
  T extends "chatReasoning" | "chat" | "small" | "embedding" | "vision",
>({
  type,
}: {
  type: T;
}): T extends "embedding" ? EmbeddingModelV1<string> : LanguageModelV1 => {
  let model = models.remote[type];

  if (process.env.USE_LOCAL_AI_MODEL === "true") {
    model = models.local[type];
  }

  return model.getProvider() as T extends "embedding"
    ? EmbeddingModelV1<string>
    : LanguageModelV1;
};
