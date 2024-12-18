import { validateEnv } from "@/lib/utils";
import { z } from "zod";

const serverEnvSchema = z.object({
  // Auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),

  // Database
  DATABASE_URL: z.string(),

  // Nodemailer
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().refine((val) => !isNaN(val), {
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
});

export const serverEnv = validateEnv(serverEnvSchema, {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_PORT: process.env.S3_PORT,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_USE_SSL: process.env.S3_USE_SSL,
});
