"use server";

import { db } from "@/db/drizzle";
import { type Course, courses } from "@/db/schema/courses";
import { auth } from "@/lib/auth";
import type { CourseSchemaType } from "@/lib/schemas/course";
import { routes } from "@/settings/routes";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const createCourse = async (course: CourseSchemaType) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.insert(courses).values({ ...course });

  revalidatePath(routes.app.sub.posts.path);
};

export const updateCourse = async (
  course: CourseSchemaType,
  courseId: Course["id"],
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db
    .update(courses)
    .set({ ...course, updatedAt: sql`now()` })
    .where(eq(courses.id, courseId));

  revalidatePath(routes.app.sub.posts.path);
};

export const deleteCourses = async (courseIds: Course["id"][]) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.delete(courses).where(inArray(courses.id, courseIds));

  revalidatePath(routes.app.sub.courses.path);
};
