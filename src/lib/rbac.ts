import "server-only";

import {
  getCourseRole,
  getOrganizationRole,
  getSession,
  isChatOwner,
} from "@/db/queries/auth";
import {
  type CourseResourceTypePermissions,
  type CourseRole,
  type OrganizationResourceTypePermissions,
  type OrganizationRole,
  coursePermissions,
  courseRoles,
  organizationPermissions,
  organizationRoles,
} from "@/settings/roles";

// Define resource type literals
export type CourseResourceType = "course" | "document" | "chat";
export type OrganizationResourceType = "organization" | "post" | "user";

// Define resource object structure with context
export interface CourseResource {
  context: "course";
  type: CourseResourceType;
  id: string | undefined | null | "all";
  orgId?: string; // Optional reference to parent organization
}

export interface OrganizationResource {
  context: "organization";
  type: OrganizationResourceType;
  id: string;
}

export type Resource = CourseResource | OrganizationResource;

// Define action types
export type Action = "read" | "write" | "delete";

/**
 * Get permissions for a specific course role
 * @param role The course role to get permissions for
 * @returns The permissions for the role
 * @throws Error if the role is invalid
 */
const getCoursePermissionsForRole = (
  role: CourseRole,
): CourseResourceTypePermissions => {
  if (!courseRoles.includes(role)) {
    throw new Error(`Invalid course role: ${role}`);
  }

  return coursePermissions[role];
};

/**
 * Get permissions for a specific organization role
 * @param role The organization role to get permissions for
 * @returns The permissions for the role
 * @throws Error if the role is invalid
 */
const getOrganizationPermissionsForRole = (
  role: OrganizationRole,
): OrganizationResourceTypePermissions => {
  if (!organizationRoles.includes(role)) {
    throw new Error(`Invalid organization role: ${role}`);
  }

  return organizationPermissions[role];
};

/**
 * Check if the current user has permission to perform an action on a course resource
 * @param resource The course resource object
 * @param action The action to check
 * @returns Whether the user has permission
 */
export const hasCoursePermission = async (
  resource: CourseResource,
  action: Action,
): Promise<boolean> => {
  if (!resource.id) return false;

  try {
    const result = await getCourseRole();
    if (!result.success || !result.data) {
      console.error("No course role found for user.");
      return false;
    }
    const courseRolePermissions = getCoursePermissionsForRole(result.data);

    // Check course-specific permissions
    if (courseRolePermissions[resource.type].includes(action)) {
      return true;
    }

    // If course permission check fails but we have an organization ID,
    // we can check if organization role grants access
    if (resource.orgId) {
      const orgRole = await getOrganizationRole(resource.orgId);

      // Admins can do anything with courses
      if (orgRole === "owner") {
        return true;
      }

      // Admins can read any course but not modify
      if (orgRole === "admin" && action === "read") {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Course permission check failed:", error);
    return false;
  }
};

/**
 * Check if the current user has permission to perform an action on an organization resource
 * @param resource The organization resource object
 * @param action The action to check
 * @returns Whether the user has permission
 */
export const hasOrganizationPermission = async (
  resource: OrganizationResource,
  action: Action,
): Promise<boolean> => {
  try {
    const session = await getSession();

    if (!session?.session.activeOrganizationId) {
      console.error("No active organization ID found in session");
      return false;
    }

    const orgRole = await getOrganizationRole(
      session.session.activeOrganizationId,
    );
    if (!orgRole) {
      console.error("No organization role found for user");
      return false;
    }
    const orgPermissions = getOrganizationPermissionsForRole(orgRole);

    return orgPermissions[resource.type].includes(action);
  } catch (error) {
    console.error("Organization permission check failed:", error);
    return false;
  }
};

/**
 * Check if the current user is the owner of a specific chat
 * @param resource The course resource object
 * @param action The action to check
 * @returns Whether the user has permission
 */
export const hasChatPermission = async (
  resource: CourseResource,
  action: Action,
): Promise<boolean> => {
  if (!resource.id) return false;

  try {
    if (await isChatOwner(resource.id)) {
      console.log("User is chat owner");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Chat permission check failed:", error);
    return false;
  }
};

/**
 * Universal permission checker that routes to the appropriate
 * context-specific permission checker
 * @param resource The resource object (either course or organization)
 * @param action The action to check
 * @returns Whether the user has permission
 */
export const hasPermission = async (
  resource: Resource,
  action: Action,
): Promise<boolean> => {
  if (resource.type === "chat") {
    return hasChatPermission(resource, action);
  } else if (resource.context === "course") {
    return hasCoursePermission(resource, action);
  } else {
    return hasOrganizationPermission(resource, action);
  }
};
