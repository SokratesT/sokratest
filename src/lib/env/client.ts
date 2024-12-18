import { validateEnv } from "@/lib/utils";
import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CHAT_API: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string(),
});

export const clientEnv = validateEnv(clientEnvSchema, {
  NEXT_PUBLIC_CHAT_API: process.env.NEXT_PUBLIC_CHAT_API,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});
