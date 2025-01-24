import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { serverEnv } from "../env/server";
import { customMiddleware } from "./custom-middleware";
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
    ];

    defaultModel = models[0];
  }

  const activeModel = model || defaultModel;

  return wrapLanguageModel({
    model: openai(activeModel.apiIdentifier),
    middleware: customMiddleware,
  });
};

// export const imageGenerationModel = openai.image("dall-e-3");
