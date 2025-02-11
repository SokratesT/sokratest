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
