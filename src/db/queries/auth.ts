"server only";

import { db } from "@/db/drizzle";
import { member } from "@/db/schema/auth";
import { courseMember } from "@/db/schema/course";
import { auth } from "@/lib/auth";
import type { CourseRole, OrganizationRole } from "@/settings/roles";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";

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
export const getCourseRole = async (courseId: string): Promise<CourseRole> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Session not found");
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
    return "guest" as CourseRole; // Default role if no membership found
  }

  // TODO: Make type safe by using enum in PG
  return query.role as CourseRole;
};

/**
 * Get the user's role for a specific organization
 * @param organizationId The organization ID to check role for
 * @returns The user's role in the organization
 * @throws Error if session not found or user has no role
 */
export const getOrganizationRole = async (
  organizationId: string,
): Promise<OrganizationRole> => {
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
    return "guest" as OrganizationRole; // Default role if no membership found
  }

  // TODO: Make type safe by using enum in PG
  return query.role as OrganizationRole;
};
