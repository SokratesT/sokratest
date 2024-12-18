import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateEnv = <T extends z.ZodTypeAny>(
  schema: T,
  env: { [key: string]: string | undefined },
) => {
  try {
    return schema.parse(env) as z.infer<T>;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const { fieldErrors } = err.flatten();
      const errorMessage = Object.entries(fieldErrors)
        .map(([field, errors]) =>
          errors ? `${field}: ${errors.join(", ")}` : field,
        )
        .join("\n  ");
      throw new Error(`Missing environment variables:\n  ${errorMessage}`);
    }
    process.exit(1);
  }
};
