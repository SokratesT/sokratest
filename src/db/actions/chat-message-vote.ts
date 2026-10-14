"use server";

import { createTraceId } from "@langfuse/tracing";
import { revalidatePath } from "next/cache";
import { voteInsertSchema } from "@/db/zod/vote";
import { langfuse } from "@/lib/langfuse/client";
import { langfuseEnvironment } from "@/lib/langfuse/environment";
import { authActionClient, checkPermissionMiddleware } from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";

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
  .action(async ({ parsedInput: { messageId, sentiment, chatId } }) => {
    // The chat trace id is derived from the assistant message id, and the
    // score id is the message id so the chat page can match votes to messages
    langfuse.score.create({
      id: messageId,
      traceId: await createTraceId(messageId),
      name: "rate_helpfulness",
      value: sentiment,
      environment: langfuseEnvironment,
    });
    await langfuse.score.flush();

    revalidatePath(ROUTES.PRIVATE.chat.view.getPath({ id: chatId }));

    return { error: null };
  });
