import { z } from "zod";
import { userInsertSchema } from "./profile";
import { sharedSchemas } from "./shared";

export const signupSchema = z
  .object({
    email: userInsertSchema.shape.email,
    name: userInsertSchema.shape.name,
    username: userInsertSchema.shape.username,
    password: sharedSchemas.password,
    confirmPassword: sharedSchemas.password,
    invitationId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignupSchemaType = z.infer<typeof signupSchema>;
