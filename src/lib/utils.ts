import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts the base schema from the given Zod schema.
 *
 * @param {z.ZodTypeAny} schema - The Zod schema to extract the base schema from.
 * @return {z.ZodObject<any> | null} The base schema if found, otherwise null.
 */
function extractBaseSchema(schema: z.ZodTypeAny): z.ZodObject<any> | null {
  if (schema instanceof z.ZodObject) {
    return schema;
  }
  if (schema instanceof z.ZodOptional) {
    return extractBaseSchema(schema._def.innerType);
  }
  if (schema instanceof z.ZodEffects && schema._def.schema) {
    return extractBaseSchema(schema._def.schema);
  }
  return null;
}

/**
 * Checks if a field is required in the given schema.
 *
 * @param {z.ZodType<any>} schema - The schema to check against.
 * @param {string} fieldPath - The name of the field to check.
 * @return {boolean} Indicates if the field is required.
 */
export function isFieldRequired(
  schema: z.ZodTypeAny,
  fieldPath: string,
): boolean {
  const baseSchema = extractBaseSchema(schema);
  if (!baseSchema) return true;

  const shape = baseSchema._def.shape();
  const keys = fieldPath.split(".");

  let currentField = shape;
  for (const key of keys) {
    if (!currentField[key]) {
      return true;
    }

    if (
      currentField[key] instanceof z.ZodObject ||
      currentField[key] instanceof z.ZodEffects
    ) {
      currentField = extractBaseSchema(currentField[key])?._def.shape();
    } else {
      return !(currentField[key] instanceof z.ZodOptional);
    }
  }

  return true;
}

/**
 * Wraps a next-safe-action promise to work with toast.promise
 * by transforming the action's result structure into a standard Promise.
 *
 * This utility converts next-safe-action's returned error structures into
 * thrown errors that toast.promise can catch in its error handler.
 *
 * @template T The expected data type that will be returned on success
 *
 * @param {Promise<{
 *   data?: T;
 *   serverError?: string;
 *   validationErrors?: any;
 *   bindArgsValidationErrors?: any;
 * } | undefined>} safeAction - The promise returned from a next-safe-action
 *
 * @returns {Promise<T>} A promise that resolves with the data or rejects with an error
 */
export function withToastPromise<T>(
  safeAction: Promise<
    | {
        data?: T;
        serverError?: string | undefined;
        validationErrors?: any;
        bindArgsValidationErrors?: any;
      }
    | undefined
  >,
): Promise<T> {
  return (async () => {
    const result = await safeAction;

    if (!result) {
      throw new Error("An unknown error occurred");
    }

    if (
      result.serverError ||
      result.validationErrors ||
      result.bindArgsValidationErrors
    ) {
      const errorMessage =
        result.serverError || "Validation failed" || "An error occurred";

      throw new Error(errorMessage);
    }

    return result.data as T;
  })();
}
