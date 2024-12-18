"use server";

import { clientEnv } from "@/lib/env/client";

export const generateEmbedding = async (url: string) => {
  console.log("Test Action");
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_CHAT_API}/api/generate/single`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: url,
          },
        ],
      }),
    },
  );

  const embedding = await res.json();

  return embedding;
};
