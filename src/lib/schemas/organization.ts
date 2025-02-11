import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type OrganizationSchemaType = z.infer<typeof organizationSchema>;
