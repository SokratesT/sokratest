"use client";

import * as React from "react";

import { useChat as useBaseChat } from "@ai-sdk/react";
import { AIChatPlugin, type AIChatPluginConfig } from "@platejs/ai/react";
import { DefaultChatTransport } from "ai";
import { useEditorRef, usePluginOption } from "platejs/react";

import { aiChatPlugin } from "@/components/editor/plugins/ai-kit";

export type Chat = AIChatPluginConfig["options"]["chat"];

export type ChatMessage = Chat["messages"][number];

export type ToolName = Extract<
  ChatMessage["parts"][number],
  { type: "data-toolName" }
>["data"];

export const useChat = () => {
  const editor = useEditorRef();
  const options = usePluginOption(aiChatPlugin, "chatOptions");

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: options.api,
        body: () => editor.getOptions(aiChatPlugin).chatOptions?.body ?? {},
      }),
    [editor, options.api],
  );

  const chat = useBaseChat<ChatMessage>({
    id: "editor",
    transport,
    onData(data) {
      if (data.type === "data-toolName") {
        editor.setOption(AIChatPlugin, "toolName", data.data);
      }
    },
  });

  React.useEffect(() => {
    editor.setOption(AIChatPlugin, "chat", chat);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Sync on chat state changes only, `chat` is a new object on every render
  }, [chat.status, chat.messages, chat.error]);

  return chat;
};
