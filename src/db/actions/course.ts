"use server";

import { db } from "@/db/drizzle";
import { session } from "@/db/schema/auth";
import { course, courseMember } from "@/db/schema/course";
import {
  courseDeleteSchema,
  courseInsertSchema,
  courseUpdateSchema,
} from "@/db/zod/course";
import {
  courseMemberDeleteSchema,
  courseMemberInsertSchema,
} from "@/db/zod/course-member";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { DEFAULT_ROLES } from "@/settings/roles";
import { ROUTES } from "@/settings/routes";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createCourse = authActionClient
  .metadata({
    actionName: "createCourse",
    permission: {
      resource: { context: "organization", type: "organization" },
      action: "write",
    },
  })
  .use(requireOrganizationMiddleware)
  .use(checkPermissionMiddleware)
  .schema(courseInsertSchema)
  .action(
    async ({
      parsedInput: { title, description, content },
      ctx: { userId, activeOrganizationId },
    }) => {
      const [newCourse] = await db
        .insert(course)
        .values({
          title,
          description,
          content,
          organizationId: activeOrganizationId,
        })
        .returning({ id: course.id });

      await db.insert(courseMember).values({
        courseId: newCourse.id,
        userId,
        role: "instructor", // TODO: Make enum
      });

      revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
      return { error: null };
    },
  );

export const updateCourse = authActionClient
  .metadata({ actionName: "updateCourse" })
  .schema(courseUpdateSchema)
  .action(async ({ parsedInput: { id, description, content, title } }) => {
    await db
      .update(course)
      .set({ id, content, title, description, updatedAt: sql`now()` })
      .where(eq(course.id, id));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  });

export const deleteCourses = authActionClient
  .metadata({ actionName: "deleteCourses" })
  .schema(courseDeleteSchema)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(course).where(inArray(course.id, ids));

    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
    return { error: null };
  });

export const addCourseMember = authActionClient
  .metadata({ actionName: "addCourseMember" })
  .schema(courseMemberInsertSchema)
  .action(async ({ parsedInput: { userId, courseId } }) => {
    await db
      .insert(courseMember)
      .values({
        courseId,
        userId,
        role: DEFAULT_ROLES.course,
      })
      .onConflictDoNothing();

    // TODO: Make more granular
    revalidatePath(ROUTES.PRIVATE.courses.root.getPath());
  });

export const removeCourseMembers = authActionClient
  .metadata({ actionName: "removeCourseMembers" })
  .schema(courseMemberDeleteSchema)
  .action(async ({ parsedInput: { ids, courseId } }) => {
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
  .metadata({ actionName: "setActiveCourse" })
  .schema(z.object({ courseId: z.string().optional() }))
  .action(async ({ parsedInput: { courseId }, ctx: { userId } }) => {
    await db
      .update(session)
      .set({ activeCourseId: courseId })
      .where(eq(session.userId, userId));
  });
