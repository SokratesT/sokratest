"use server";

import { voteInsertSchema } from "@/db/zod/vote";
import { langfuseServer } from "@/lib/langfuse/langfuse-server";
import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

export const voteMessage = authActionClient
  .metadata({ actionName: "voteMessage" })
  .schema(voteInsertSchema)
  .action(async ({ parsedInput: { messageId, sentiment, chatId }, ctx }) => {
    langfuseServer.score({
      id: messageId,
      traceId: messageId,
      observationId: ctx.userId,
      name: "user_feedback",
      value: sentiment,
    });

    revalidatePath(`/chat/${chatId}`);

    return { error: null };
  });
