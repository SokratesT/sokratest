"use server";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { chatDeleteSchema } from "@/db/zod/chat";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createChat = authActionClient
  .metadata({ actionName: "createChat" })
  .use(requireCourseMiddleware)
  .use(requireOrganizationMiddleware)
  .action(async ({ ctx: { activeCourseId, userId } }) => {
    const [query] = await db
      .insert(chat)
      .values({
        title: "New Chat",
        userId,
        courseId: activeCourseId,
      })
      .returning({ id: chat.id });

    return { chat: query, error: null };
  });

export const deleteChat = authActionClient
  .metadata({
    actionName: "deleteChat",
    permission: {
      resource: { context: "course", type: "chat" },
      action: "delete",
    },
  })
  .schema(chatDeleteSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(chat).where(inArray(chat.id, ids));

    revalidatePath(ROUTES.PRIVATE.chat.add.getPath());
    return { error: null };
  });
