"use server";

import { db } from "@/db/drizzle";
import { courseMember } from "@/db/schema/course";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateUserRole = authActionClient
  .metadata({
    actionName: "updateUserRole",
    permission: {
      resource: { context: "organization", type: "user" },
      action: "write",
    },
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      role: z.enum(["instructor", "student"]),
    }),
  )
  .use(requireCourseMiddleware)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { ids, role }, ctx: { activeCourseId } }) => {
    await db
      .update(courseMember)
      .set({ role })
      .where(
        and(
          inArray(courseMember.userId, ids),
          eq(courseMember.courseId, activeCourseId),
        ),
      );

    revalidatePath(ROUTES.PRIVATE.users.root.getPath());
    return { error: null };
  });
