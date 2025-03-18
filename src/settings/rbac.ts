"server only";

import { db } from "@/db/drizzle";
import { courseMember } from "@/db/schema/course";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// Define resource type literals
type ResourceType = "course" | "document";

// Define resource object structure
interface Resource {
  type: ResourceType;
  id: string;
}

// Define action types
type Action = "read" | "write" | "delete";

// Define role types
type Role = "instructor" | "user" | "guest";

// Define permission structure - now indexed by resource type
type ResourceTypePermissions = Record<ResourceType, Action[]>;
type RolePermissions = Record<Role, ResourceTypePermissions>;

// Define the permissions with proper typing
export const permissions: RolePermissions = {
  instructor: {
    course: ["read", "write", "delete"],
    document: ["read", "write", "delete"],
  },
  user: {
    course: ["read"],
    document: ["read"],
  },
  guest: {
    course: [],
    document: [],
  },
};

// Type-safe roles array derived from the permissions object
const roles: Role[] = Object.keys(permissions) as Role[];

/**
 * Get permissions for a specific role
 * @param role The role to get permissions for
 * @returns The permissions for the role
 * @throws Error if the role is invalid
 */
const getPermissions = (role: Role): ResourceTypePermissions => {
  if (!roles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  return permissions[role];
};

/**
 * Get the user's role for a specific course
 * @param courseId The course ID to check role for
 * @returns The user's role in the course
 * @throws Error if session not found or user has no role
 */
const getCourseRole = async (courseId: string): Promise<Role> => {
  const session = await auth.api.getSession({ headers: await headers() });

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
    return "guest" as Role; // Default role if no membership found
  }

  // TODO: Make type safe by using enum in PG
  return query.role as Role;
};

/**
 * Check if the current user has permission to perform an action on a resource
 * @param resource The resource object with type and id
 * @param action The action to check
 * @returns Whether the user has permission
 */
export const hasPermission = async (
  resource: Resource,
  action: Action,
): Promise<boolean> => {
  try {
    const role = await getCourseRole(resource.id);

    const rolePermissions = getPermissions(role);
    return rolePermissions[resource.type].includes(action);
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};
