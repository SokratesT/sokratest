import { serverEnv } from "@/lib/env/server";
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";
import type { Model } from "./models";

export const customModel = ({
  model,
  mode,
}: { model?: Model; mode: "saia" | "local" }) => {
  let openai: OpenAIProvider;
  let models: Model[];
  let defaultModel: Model;

  if (mode === "saia") {
    openai = createOpenAI({
      baseURL: serverEnv.OPENAI_COMPATIBLE_BASE_URL,
      apiKey: serverEnv.OPENAI_COMPATIBLE_API_KEY,
      compatibility: "compatible",
      name: "chatAi",
    });

    models = [
      {
        id: "meta-llama-3.1-8b-instruct",
        label: "Llama 3.1 (8b)",
        apiIdentifier: "meta-llama-3.1-8b-instruct",
        description: "Model description for 3.1 8b",
      },
      {
        id: "llama-3.3-70b-instruct",
        label: "Llama 3.3 (70b)",
        apiIdentifier: "llama-3.3-70b-instruct",
        description: "Model description for 3.3 70b",
      },
      {
        id: "deepseek-r1-distill-llama-70b",
        label: "Deepseek R1 (70b)",
        apiIdentifier: "deepseek-r1-distill-llama-70b",
        description: "Model description for Deepseek R1",
      },
    ];
    defaultModel = models[1];
  } else {
    openai = createOpenAI({
      baseURL: "http://localhost:11434/v1",
      apiKey: "ollama",
      compatibility: "compatible",
      name: "ollama",
    });

    models = [
      {
        id: "llama3.1",
        label: "Llama 3.1",
        apiIdentifier: "llama3.1:latest",
        description: "Local Llama",
      },
      {
        id: "deepseek-r1:14b",
        label: "Deepseek R1",
        apiIdentifier: "deepseek-r1:14b",
        description: "Local R1",
      },
    ];

    defaultModel = models[0];
  }

  const activeModel = model || defaultModel;

  return wrapLanguageModel({
    model: openai(activeModel.apiIdentifier),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};
