"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { course, courseMember } from "@/db/schema/course";
import { courseInvitation } from "@/db/schema/course-invitation";
import {
  courseInvitationDeleteSchema,
  courseInvitationSelectSchema,
  courseInvitationsInsertSchema,
} from "@/db/zod/course-invitation";
import { auth } from "@/lib/auth";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
} from "@/lib/safe-action";
import { type CourseRole, DEFAULT_ROLES } from "@/settings/roles";
import { ROUTES } from "@/settings/routes";
import { setActiveCourse } from "./course";

export const createCourseInvitations = authActionClient
  .metadata({
    actionName: "createCourseInvitations",
    permission: {
      resource: { context: "course", type: "invitation" },
      action: "create",
    },
  })
  .use(requireCourseMiddleware)
  .use(checkPermissionMiddleware)
  .schema(courseInvitationsInsertSchema)
  .action(
    async ({
      parsedInput: { expiresAt, items, courseId, role },
      ctx: { userId },
    }) => {
      const invitations = items.map((item) => ({
        email: item.email,
        courseId,
        role: role as CourseRole,
        status: "pending",
        expiresAt,
        inviterId: userId,
      }));

      await db.insert(courseInvitation).values(invitations);

      revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
      return { error: null };
    },
  );

export const deleteCourseInvitations = authActionClient
  .metadata({
    actionName: "deleteCourseInvitations",
    permission: {
      resource: { context: "course", type: "invitation" },
      action: "delete",
    },
  })
  .schema(courseInvitationDeleteSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(courseInvitation).where(inArray(courseInvitation.id, ids));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    revalidatePath(ROUTES.PRIVATE.app.account.getPath());
    return { error: null };
  });

export const acceptCourseInvitation = authActionClient
  .metadata({
    actionName: "acceptCourseInvitation",
  })
  .schema(courseInvitationSelectSchema)
  .action(async ({ parsedInput: { id, courseId, role }, ctx }) => {
    const [query] = await db
      .select({ organizationId: course.organizationId })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

    const userOrganizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (
      userOrganizations.filter((org) => org.id === query.organizationId)
        .length === 0
    ) {
      await auth.api.addMember({
        body: {
          userId: ctx.userId,
          organizationId: query.organizationId,
          role: DEFAULT_ROLES.organization,
        },
      });
    }

    await db
      .insert(courseMember)
      .values({
        courseId,
        userId: ctx.userId,
        role: role as CourseRole,
        createdAt: new Date(),
      })
      .onConflictDoNothing();

    await db
      .update(courseInvitation)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(courseInvitation.id, id));

    await auth.api.setActiveOrganization({
      body: {
        organizationId: query.organizationId,
      },
      headers: await headers(),
    });

    await setActiveCourse({
      courseId,
    });

    revalidatePath(ROUTES.PRIVATE.root.getPath());
    return { error: null };
  });

export const rejectCourseInvitation = authActionClient
  .metadata({
    actionName: "rejectCourseInvitation",
    permission: {
      resource: { context: "course", type: "invitation" },
      action: "update",
    },
  })
  .schema(z.object({ id: z.string().uuid() }))
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { id } }) => {
    await db
      .update(courseInvitation)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(courseInvitation.id, id));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  });
