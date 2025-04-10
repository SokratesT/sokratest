"use server";

import { voteInsertSchema } from "@/db/zod/vote";
import { langfuseServer } from "@/lib/langfuse/langfuse-server";
import { authActionClient, checkPermissionMiddleware } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

export const voteMessage = authActionClient
  .metadata({
    actionName: "voteMessage",
    permission: {
      resource: { context: "course", type: "chat" },
      action: "update",
    },
  })
  .schema(voteInsertSchema)
  .use(checkPermissionMiddleware)
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
