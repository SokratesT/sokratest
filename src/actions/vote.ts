"use server";

import { db } from "@/db/drizzle";
import { votes } from "@/db/schema/votes";
import { authActionClient } from "@/lib/safe-action";
import { voteInsertSchema } from "@/lib/schemas/vote";

export const voteMessage = authActionClient
  .metadata({ actionName: "voteMessage" })
  .schema(voteInsertSchema)
  .action(async ({ parsedInput: { messageId, sentiment } }) => {
    await db
      .insert(votes)
      .values({ messageId, sentiment })
      .onConflictDoUpdate({ target: votes.messageId, set: { sentiment } });

    return { error: null };
  });
