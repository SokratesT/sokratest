"use server";

import { db } from "@/db/drizzle";
import { chat } from "@/db/schema/chat";
import {
  authActionClient,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { chatDeleteSchema } from "@/lib/schemas/chat";
import { routes } from "@/settings/routes";
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
  .metadata({ actionName: "deleteChat" })
  .schema(chatDeleteSchema)
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(chat).where(inArray(chat.id, ids));

    revalidatePath(routes.app.sub.chat.path);
    return { error: null };
  });
