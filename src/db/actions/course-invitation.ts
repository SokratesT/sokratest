"use server";

import { db } from "@/db/drizzle";
import { course } from "@/db/schema/course";
import { courseInvitation } from "@/db/schema/course-invitation";
import {
  courseInvitationDeleteSchema,
  courseInvitationSelectSchema,
  courseInvitationsInsertSchema,
} from "@/db/zod/course-invitation";
import { auth } from "@/lib/auth";
import {
  authActionClient,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { addCourseMember, setActiveCourse } from "./course";

export const createCourseInvitations = authActionClient
  .metadata({ actionName: "createCourseInvitations" })
  .use(requireOrganizationMiddleware)
  .schema(courseInvitationsInsertSchema)
  .action(
    async ({
      parsedInput: { expiresAt, items, courseId, role },
      ctx: { userId, activeOrganizationId },
    }) => {
      const invitations = items.map((item) => ({
        email: item.email,
        courseId,
        role,
        status: "pending",
        expiresAt,
        inviterId: userId,
      }));

      await db.insert(courseInvitation).values(invitations);

      revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
      return { error: null };
    },
  );

/* export const updateCourseInvitation = authActionClient
  .metadata({ actionName: "updateCourseInvitation" })
  .schema(courseInvitationUpdateSchema)
  .action(async ({ parsedInput: { id, email, expireAt, invitationCode } }) => {
    await db
      .update(course)
      .set({ id, content, title, description, updatedAt: sql`now()` })
      .where(eq(courseInvitation.id, id));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  }); */

export const deleteCourseInvitations = authActionClient
  .metadata({ actionName: "deleteCourseInvitations" })
  .schema(courseInvitationDeleteSchema)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(courseInvitation).where(inArray(courseInvitation.id, ids));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  });

export const acceptCourseInvitation = authActionClient
  .metadata({ actionName: "acceptCourseInvitation" })
  .schema(courseInvitationSelectSchema)
  .action(async ({ parsedInput: { id, courseId, role }, ctx }) => {
    const [query] = await db
      .select({ organizationId: course.organizationId })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

    console.log("query", query);

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
          role: "member",
        },
      });
    }

    await addCourseMember({
      courseId,
      userId: ctx.userId,
      role,
      createdAt: new Date(),
    });

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
