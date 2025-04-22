"use server";

import { db } from "@/db/drizzle";
import { getUserPreferences } from "@/db/queries/users";
import { member, user } from "@/db/schema/auth";
import { courseMember } from "@/db/schema/course";
import { auth } from "@/lib/auth";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateUserCourseRole = authActionClient
  .metadata({
    actionName: "updateUserRole",
    permission: {
      resource: { context: "organization", type: "user" },
      action: "update",
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

export const updateUserOrganizationRole = authActionClient
  .metadata({
    actionName: "updateUserRole",
    permission: {
      resource: { context: "organization", type: "user" },
      action: "update",
    },
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      role: z.enum(["admin", "member"]),
    }),
  )
  .use(requireOrganizationMiddleware)
  .use(checkPermissionMiddleware)
  .action(
    async ({ parsedInput: { ids, role }, ctx: { activeOrganizationId } }) => {
      await db
        .update(member)
        .set({ role })
        .where(
          and(
            inArray(member.userId, ids),
            eq(member.organizationId, activeOrganizationId),
          ),
        );

      revalidatePath(ROUTES.PRIVATE.users.root.getPath());
      return { error: null };
    },
  );

export const createAdmin = async ({
  email,
  password,
  name,
}: { email: string; password: string; name: string }) => {
  const [userCount] = await db.select({ count: count() }).from(user);

  if (userCount.count > 0) {
    return;
  }

  auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: "admin",
    },
  });
};

export const completeTour = authActionClient
  .metadata({
    actionName: "completeTour",
  })
  .schema(
    z.object({
      tour: z.enum(["initialTour"]),
      action: z.enum(["completed", "skipped"]),
    }),
  )
  .action(async ({ parsedInput: { tour, action }, ctx: { userId } }) => {
    const result = await getUserPreferences();

    if (!result.success) {
      return { error: "Failed to get user preferences" };
    }

    const preferences = result.data.query.preferences;

    const updatedPreferences = {
      ...preferences,
      tours: {
        ...preferences?.tours,
        [tour]: action,
      },
    };

    await db
      .update(user)
      .set({ preferences: updatedPreferences })
      .where(eq(user.id, userId));

    return { error: null };
  });
