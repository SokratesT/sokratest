import { z } from "zod";
import { sharedSchemas } from "./shared";

export const profileSchema = z.object({
  email: sharedSchemas.email,
  username: sharedSchemas.username,
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;
