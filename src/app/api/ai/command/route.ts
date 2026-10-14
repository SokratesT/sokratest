import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  toUIMessageStream,
} from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSlateEditor } from "platejs";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import type { ChatMessage, ToolName } from "@/components/editor/use-chat";
import { getSaiaModel } from "@/lib/ai/saia-models";
import { markdownJoinerTransform } from "@/lib/markdown-joiner-transform";
import {
  getChooseToolPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from "./prompt";

export async function POST(req: NextRequest) {
  const { ctx, messages: messagesRaw } = await req.json();

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const isSelecting = editor.api.isExpanded();

  const model = getSaiaModel({
    input: ["text"],
    model: "meta-llama-3.1-8b-instruct",
  }).provider;

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName: ToolName = toolNameParam ?? "generate";

        if (!toolNameParam && isSelecting) {
          const toolNames: ToolName[] = ["generate", "edit"];
          const { output } = await generateText({
            model,
            output: Output.choice({ options: toolNames }),
            prompt: getChooseToolPrompt({
              isSelecting,
              messages: messagesRaw,
            }),
            telemetry: { isEnabled: false },
          });

          toolName = output;
        }

        if (!toolNameParam) {
          writer.write({ data: toolName, type: "data-toolName" });
        }

        const [prompt] =
          toolName === "edit"
            ? getEditPrompt(editor, { isSelecting, messages: messagesRaw })
            : [
                getGeneratePrompt(editor, {
                  isSelecting,
                  messages: messagesRaw,
                }),
              ];

        const result = streamText({
          experimental_transform: markdownJoinerTransform(),
          maxOutputTokens: 2048,
          model,
          prompt,
          telemetry: { isEnabled: false },
        });

        writer.merge(
          toUIMessageStream({
            sendFinish: false,
            stream: result.stream,
          }),
        );
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
