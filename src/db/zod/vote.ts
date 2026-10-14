import { z } from "zod/v4";

export const voteInsertSchema = z.object({
  messageId: z.string(),
  sentiment: z.number(),
  chatId: z.string(),
});
