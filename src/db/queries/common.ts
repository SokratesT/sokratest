import { db } from "@/db/drizzle";
import { courseMember } from "@/db/schema/courses";
import { auth } from "@/lib/auth";
import type { authClient } from "@/lib/auth-client";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { member } from "../schema/auth";

type CourseRole = "admin" | "instructor" | "student";
type OrganizationRole = "admin" | "student";

type ResourceOptions =
  | {
      type: "course";
      id: string;
      requiredRoles?: CourseRole[];
    }
  | {
      type: "organization";
      id: string;
      requiredRoles?: OrganizationRole[];
    };

// Define the base session type
type BaseSession = typeof authClient.$Infer.Session;

// Use conditional types to build session types dynamically
type EnhancedSession<TOptions extends AuthQueryOptions> = BaseSession & {
  session: BaseSession["session"] &
    (TOptions["requireOrg"] extends true
      ? { activeOrganizationId: string }
      : {
          activeOrganizationId?: BaseSession["session"]["activeOrganizationId"];
        }) &
    (TOptions["requireCourse"] extends true
      ? { activeCourseId: string }
      : { activeCourseId?: BaseSession["session"]["activeCourseId"] });
};

export type AuthQueryOptions = {
  requireOrg?: boolean;
  requireCourse?: boolean;
  resource?: ResourceOptions;
};

// Single overloaded function that handles all cases
export async function withAuthQuery<T, TOptions extends AuthQueryOptions>(
  queryFn: (
    session: EnhancedSession<TOptions>,
    db: typeof import("@/db/drizzle").db,
  ) => Promise<T>,
  options: TOptions,
): Promise<T>;

// Implementation
export async function withAuthQuery<T>(
  queryFn: (session: any, db: typeof import("@/db/drizzle").db) => Promise<T>,
  options: AuthQueryOptions = {},
): Promise<T> {
  // Get session (cached by Next.js when called multiple times in same request)
  const session = await auth.api.getSession({ headers: await headers() });

  // Check if authentication is required
  if (!session) {
    throw new Error("Not authenticated");
  }

  // Check if organization is required
  if (options.requireOrg && !session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }

  // Check if course is required
  if (options.requireCourse && !session?.session.activeCourseId) {
    throw new Error("No active course");
  }

  // Check resource access if needed
  if (options.resource?.requiredRoles?.length) {
    const hasAccess = await validateResourceAccess(
      session.session.userId,
      options.resource,
    );

    if (!hasAccess) {
      throw new Error(
        `Insufficient permissions for ${options.resource.type} ${options.resource.id}`,
      );
    }
  }

  // Execute the actual query function with the right type
  return queryFn(session, db);
}

async function validateResourceAccess(
  userId: string,
  resource: ResourceOptions,
): Promise<boolean> {
  switch (resource.type) {
    case "course": {
      const [memberEntry] = await db
        .select()
        .from(courseMember)
        .where(
          and(
            eq(courseMember.userId, userId),
            eq(courseMember.courseId, resource.id),
          ),
        );

      return memberEntry
        ? (resource.requiredRoles?.includes(memberEntry.role as CourseRole) ??
            true)
        : false;
    }

    case "organization": {
      const [memberEntry] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, userId),
            eq(member.organizationId, resource.id),
          ),
        );

      return memberEntry
        ? (resource.requiredRoles?.includes(
            memberEntry.role as OrganizationRole,
          ) ?? true)
        : false;
    }
  }
}
