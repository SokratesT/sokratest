"use server";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import { chatDeleteSchema, chatUpdateSchema } from "@/db/zod/chat";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createChat = authActionClient
  .metadata({
    actionName: "createChat",
    permission: {
      resource: { context: "course", type: "chat" },
      action: "create",
    },
  })
  .use(requireCourseMiddleware)
  .use(requireOrganizationMiddleware)
  .use(checkPermissionMiddleware)
  .action(async ({ ctx: { activeCourseId, userId } }) => {
    const [query] = await db
      .insert(chat)
      .values({
        title: "New Chat",
        userId,
        courseId: activeCourseId,
      })
      .returning({ id: chat.id });

    revalidatePath(ROUTES.PRIVATE.root.getPath());
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
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(chat).where(inArray(chat.id, ids));

    revalidatePath(ROUTES.PRIVATE.chat.add.getPath());
    return { error: null };
  });

export const renameChat = authActionClient
  .metadata({
    actionName: "renameChat",
    permission: {
      resource: { context: "course", type: "chat" },
      action: "update",
    },
  })
  .schema(chatUpdateSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { id, title } }) => {
    await db.update(chat).set({ title }).where(eq(chat.id, id));

    revalidatePath(ROUTES.PRIVATE.chat.add.getPath());
    return { error: null };
  });
