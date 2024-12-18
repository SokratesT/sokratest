"use client";

import { clientEnv } from "@/lib/env/client";

export interface ChatConfig {
  backend?: string;
}

function getBackendOrigin(): string {
  const chatAPI = clientEnv.NEXT_PUBLIC_CHAT_API;
  if (chatAPI) {
    return new URL(chatAPI).origin;
  } else {
    if (typeof window !== "undefined") {
      // Use BASE_URL from window.ENV
      return (window as any).ENV?.BASE_URL || "";
    }
    return "";
  }
}

export function useClientConfig(): ChatConfig {
  return {
    backend: getBackendOrigin(),
  };
}
