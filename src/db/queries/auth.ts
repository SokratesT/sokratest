import "server-only";

import { db } from "@/db/drizzle";
import { member } from "@/db/schema/auth";
import { chat } from "@/db/schema/chat";
import { type Course, courseMember } from "@/db/schema/course";
import { auth } from "@/lib/auth";
import type { CourseRole, OrganizationRole } from "@/settings/roles";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { type AuthResult, withAuthQuery } from "./utils/with-auth-query";

/**
 * Get the current session from the auth API
 * @returns The current session
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return session;
});

/**
 * Get the active organization from the auth API
 * @returns The active organization
 */
export const getActiveOrganization = cache(async () => {
  const activeOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  return activeOrganization;
});

/**
 * Get the user's role for a specific course
 * @param courseId The course ID to check role for
 * @returns The user's role in the course
 * @throws Error if session not found or user has no role
 */
export const getActiveCourseRole = async (
  id?: Course["id"],
): Promise<AuthResult<CourseRole | undefined>> => {
  return withAuthQuery(async (session) => {
    const courseId = session.session.activeCourseId || id;

    if (!courseId) {
      throw new Error("Course ID not found");
    }

    const [query] = await db
      .select({ role: courseMember.role })
      .from(courseMember)
      .where(
        and(
          eq(courseMember.userId, session.session.userId),
          eq(courseMember.courseId, courseId),
        ),
      );

    if (!query) {
      return undefined;
    }

    // TODO: Make type safe by using enum in PG
    return query.role as CourseRole;
  }, {});
};

/**
 * Get the user's role for a specific organization
 * @param organizationId The organization ID to check role for
 * @returns The user's role in the organization
 * @throws Error if session not found or user has no role
 */
export const getOrganizationRole = async (
  organizationId: string,
): Promise<OrganizationRole | undefined> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Session not found");
  }

  const [query] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.userId, session.session.userId),
        eq(member.organizationId, organizationId),
      ),
    );

  if (!query) {
    return undefined;
  }

  // TODO: Make type safe by using enum in PG
  return query.role as OrganizationRole;
};

/**
 * Check if the current user is the owner of a specific chat
 * @param chatId The chat ID to check ownership for
 * @returns Whether the user is the owner of the chat
 * @throws Error if session not found
 */
export const isChatOwner = async (
  chatId: string,
): Promise<AuthResult<boolean>> => {
  return withAuthQuery(
    async (session) => {
      const [query] = await db
        .select({ id: chat.id })
        .from(chat)
        .where(
          and(eq(chat.userId, session.session.userId), eq(chat.id, chatId)),
        );

      return !!query;
    },
    { requireCourse: true },
  );
};
