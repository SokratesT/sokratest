import { db } from "@/db/drizzle";
import { getSession } from "@/db/queries/auth";
import type { authClient } from "@/lib/auth-client";
import { type Action, type Resource, hasPermission } from "@/lib/rbac";

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

// Define error codes for better error handling
export enum AuthErrorCode {
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  NO_ACTIVE_ORGANIZATION = "NO_ACTIVE_ORGANIZATION",
  NO_ACTIVE_COURSE = "NO_ACTIVE_COURSE",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  QUERY_EXECUTION_ERROR = "QUERY_EXECUTION_ERROR",
}

// Define a structured error response type
export type AuthError = {
  code: AuthErrorCode;
  message: string;
  context?: Record<string, unknown>;
};

// Define a result type that either contains data or an error
export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

// Update function signatures for the new return type
export async function withAuthQuery<T, TOptions extends AuthQueryOptions>(
  queryFn: (
    session: EnhancedSession<TOptions>,
    db: typeof import("@/db/drizzle").db,
  ) => Promise<T>,
  options: TOptions,
): Promise<AuthResult<T>>;

// Implementation
export async function withAuthQuery<T>(
  queryFn: (session: any, db: typeof import("@/db/drizzle").db) => Promise<T>,
  options: AuthQueryOptions = { byPassAuth: false },
): Promise<AuthResult<T>> {
  try {
    // Get session (cached by Next.js when called multiple times in same request)
    const session = await getSession();

    // Check if authentication is required
    if (!session && !options.byPassAuth) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.NOT_AUTHENTICATED,
          message: "User is not authenticated",
        },
      };
    }

    // Check if active organization is required
    if (options.requireOrg && !session?.session.activeOrganizationId) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.NO_ACTIVE_ORGANIZATION,
          message: "No active organization selected",
        },
      };
    }

    // Check if active course is required
    if (options.requireCourse && !session?.session.activeCourseId) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.NO_ACTIVE_COURSE,
          message: "No active course selected",
        },
      };
    }

    // Check resource access if needed
    if (options.access) {
      const hasAccess = await hasPermission(
        { ...options.access.resource },
        options.access.action,
      );

      if (!hasAccess) {
        return {
          success: false,
          error: {
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            message: `Insufficient permissions for this operation`,
            context: {
              action: options.access.action,
              resource: options.access.resource.id,
            },
          },
        };
      }
    }

    // Execute the actual query function with the right type
    const result = await queryFn(session, db);
    return { success: true, data: result };
  } catch (error) {
    // Handle unexpected errors during execution
    return {
      success: false,
      error: {
        code: AuthErrorCode.QUERY_EXECUTION_ERROR,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        context: { originalError: error },
      },
    };
  }
}
