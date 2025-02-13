import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export const serverEnv = createEnv({
  server: {
    // Auth
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),

    // Database
    DATABASE_URL: z.string(),

    // Nodemailer
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().refine((val) => !Number.isNaN(val), {
      message: "SMTP_PORT must be a valid number",
    }),
    SMTP_USERNAME: z.string(),
    SMTP_PASSWORD: z.string(),

    // S3 Storage
    S3_ENDPOINT: z.string(),
    S3_PORT: z.coerce.number().optional(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_USE_SSL: z.string().optional(),

    // Trigger.dev
    TRIGGER_SECRET_KEY: z.string(),
    TRIGGER_API_URL: z.string(),

    // Unstructured Service
    UNSTRUCTURED_API_URL: z.string(),
    UNSTRUCTURED_SECRET_KEY: z.string(),

    // AI Service
    OPENAI_COMPATIBLE_BASE_URL: z.string(),
    OPENAI_COMPATIBLE_API_KEY: z.string(),
  },
  experimental__runtimeEnv: process.env,
});
