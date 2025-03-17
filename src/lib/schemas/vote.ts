import { chatMessageVote } from "@/db/schema/chat-message-vote";
import { createInsertSchema } from "drizzle-zod";

export const voteInsertSchema = createInsertSchema(chatMessageVote);
