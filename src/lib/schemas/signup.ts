import { z } from "zod";
import { sharedSchemas } from "./shared";

export const signupSchema = z
  .object({
    email: sharedSchemas.email,
    name: sharedSchemas.name,
    username: sharedSchemas.username,
    password: sharedSchemas.password,
    confirmPassword: sharedSchemas.password,
    invitationId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignupSchemaType = z.infer<typeof signupSchema>;
