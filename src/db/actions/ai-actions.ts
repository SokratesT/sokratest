"use server";

import { string, z } from "zod";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/db/queries/ai-queries";
import { authActionClient, checkPermissionMiddleware } from "@/lib/safe-action";

export const deleteTrailingMessages = authActionClient
  .metadata({
    actionName: "deleteTrailingMessages",
    permission: {
      resource: { context: "course", type: "chat" },
      action: "update",
    },
  })
  .schema(z.object({ chatId: string(), messageId: string() }))
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { messageId } }) => {
    const [message] = await getMessageById({ id: messageId });

    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  });
