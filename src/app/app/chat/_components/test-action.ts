"use server";

import { clientEnv } from "@/lib/env/client";

export const testAction = async () => {
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_CHAT_API}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    }),
  });

  console.log(JSON.stringify(res));
};
