"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { session } from "@/db/schema/auth";
import { course, courseMember } from "@/db/schema/course";
import {
  courseDeleteSchema,
  courseInsertSchema,
  courseUpdateSchema,
} from "@/db/zod/course";
import { courseMemberDeleteSchema } from "@/db/zod/course-member";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";

export const createCourse = authActionClient
  .metadata({
    actionName: "createCourse",
    permission: {
      resource: { context: "organization", type: "organization" },
      action: "update",
    },
  })
  .use(requireOrganizationMiddleware)
  .use(checkPermissionMiddleware)
  .schema(courseInsertSchema)
  .action(
    async ({
      parsedInput: { title, description, content, config },
      ctx: { userId, activeOrganizationId },
    }) => {
      const [newCourse] = await db
        .insert(course)
        .values({
          title,
          description,
          content,
          organizationId: activeOrganizationId,
          config,
        })
        .returning({ id: course.id });

      await db.insert(courseMember).values({
        courseId: newCourse.id,
        userId,
        role: "instructor", // TODO: Make enum
      });

      revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
      return { error: null, courseId: newCourse.id };
    },
  );

export const updateCourse = authActionClient
  .metadata({
    actionName: "updateCourse",
    permission: {
      resource: { context: "course", type: "course" },
      action: "update",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(courseUpdateSchema)
  .action(
    async ({ parsedInput: { id, description, content, title, config } }) => {
      await db
        .update(course)
        .set({ id, content, title, description, config, updatedAt: new Date() })
        .where(eq(course.id, id));

      revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
      return { error: null };
    },
  );

export const deleteCourses = authActionClient
  .metadata({
    actionName: "deleteCourses",
    permission: {
      resource: { context: "course", type: "course" },
      action: "delete",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(courseDeleteSchema)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(course).where(inArray(course.id, ids));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  });

export const removeCourseMembers = authActionClient
  .metadata({
    actionName: "removeCourseMembers",
    permission: {
      resource: { context: "course", type: "course" },
      action: "update",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(courseMemberDeleteSchema)
  .action(async ({ parsedInput: { refs, courseId } }) => {
    const ids = refs.map((ref) => ref.id);

    await db
      .delete(courseMember)
      .where(
        and(
          inArray(courseMember.userId, ids),
          eq(courseMember.courseId, courseId),
        ),
      );
    // TODO: Make more granular
    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
  });

export const setActiveCourse = authActionClient
  .metadata({
    actionName: "setActiveCourse",
    permission: {
      resource: { context: "course", type: "course" },
      action: "read",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(z.object({ courseId: z.string().optional() }))
  .action(async ({ parsedInput: { courseId }, ctx: { userId } }) => {
    await db
      .update(session)
      .set({ activeCourseId: courseId })
      .where(eq(session.userId, userId));

    revalidatePath(ROUTES.PRIVATE.root.getPath());
  });

export const resetActiveCourse = authActionClient
  .metadata({
    actionName: "resetActiveCourse",
  })
  .action(async ({ ctx: { userId } }) => {
    await db
      .update(session)
      .set({ activeCourseId: undefined })
      .where(eq(session.userId, userId));

    revalidatePath(ROUTES.PRIVATE.root.getPath());
  });
