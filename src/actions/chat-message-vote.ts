"use server";

import { db } from "@/db/drizzle";
import { chatMessageVote } from "@/db/schema/chat-message-vote";
import { authActionClient } from "@/lib/safe-action";
import { voteInsertSchema } from "@/lib/schemas/vote";

export const voteMessage = authActionClient
  .metadata({ actionName: "voteMessage" })
  .schema(voteInsertSchema)
  .action(async ({ parsedInput: { messageId, sentiment } }) => {
    await db
      .insert(chatMessageVote)
      .values({ messageId, sentiment })
      .onConflictDoUpdate({
        target: chatMessageVote.messageId,
        set: { sentiment },
      });

    return { error: null };
  });
