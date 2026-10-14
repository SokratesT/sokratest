import { z } from "zod";

export const voteInsertSchema = z.object({
  messageId: z.string(),
  sentiment: z.number(),
  chatId: z.string(),
});
