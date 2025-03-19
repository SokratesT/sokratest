import { db } from "@/db/drizzle";
import type { authClient } from "@/lib/auth-client";
import { type Action, type Resource, hasPermission } from "@/lib/rbac";
import { getSession } from "../auth";

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

type AuthQueryOptions = {
  byPassAuth?: boolean;
  requireOrg?: boolean;
  requireCourse?: boolean;
  access?: {
    resource: Resource;
    action: Action;
  };
};

// Single overloaded function that handles all cases
// TypeScript function overload:
// 1. First signature provides strongly-typed parameters and return values
// 2. Implementation signature provides the actual function body
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
  options: AuthQueryOptions = { byPassAuth: false },
): Promise<T> {
  // Get session (cached by Next.js when called multiple times in same request)
  const session = await getSession();

  // Check if authentication is required
  if (!session && !options.byPassAuth) {
    throw new Error("Not authenticated");
  }

  // Check if active organization is required
  if (options.requireOrg && !session?.session.activeOrganizationId) {
    throw new Error("No active organization");
  }

  // Check if active course is required
  if (options.requireCourse && !session?.session.activeCourseId) {
    throw new Error("No active course");
  }

  // Check resource access if needed
  if (options.access) {
    const hasAccess = await hasPermission(
      { ...options.access.resource },
      options.access.action,
    );

    if (!hasAccess) {
      throw new Error(
        `Insufficient permissions for ${options.access.action} ${options.access.resource.id}`,
      );
    }
  }

  // Execute the actual query function with the right type
  return queryFn(session, db);
}
