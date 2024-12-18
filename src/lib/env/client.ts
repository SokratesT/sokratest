import { validateEnv } from "@/lib/utils";
import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CHAT_API: z.string().optional(),
});

export const clientEnv = validateEnv(clientEnvSchema, {
  NEXT_PUBLIC_CHAT_API: process.env.NEXT_PUBLIC_CHAT_API,
});
