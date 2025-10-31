import type {
  Action,
  CourseResourceType,
  OrganizationResourceType,
} from "@/lib/rbac";

// Define role types
// TODO: Make enum from PG
export type CourseRole = "instructor" | "student";
export type OrganizationRole = "owner" | "admin" | "member";

// Define permission structure - now indexed by resource type
export type CourseResourceTypePermissions = Record<
  CourseResourceType,
  Action[]
>;
type CourseRolePermissions = Record<CourseRole, CourseResourceTypePermissions>;

export type OrganizationResourceTypePermissions = Record<
  OrganizationResourceType,
  Action[]
>;
type OrganizationRolePermissions = Record<
  OrganizationRole,
  OrganizationResourceTypePermissions
>;

export const coursePermissions: CourseRolePermissions = {
  instructor: {
    course: ["read", "update", "delete", "create"],
    document: ["read", "update", "delete", "create"],
    chat: ["read", "update", "delete", "create"],
    invitation: ["read", "update", "delete", "create"],
  },
  student: {
    course: ["read"],
    document: [],
    chat: ["read", "update", "delete", "create"],
    invitation: ["read", "update"],
  },
};

export const organizationPermissions: OrganizationRolePermissions = {
  owner: {
    organization: ["read", "update", "delete", "create"],
    user: ["read", "update", "delete", "create"],
  },
  admin: {
    organization: ["read", "update"],
    user: ["read", "update", "delete", "create"],
  },
  member: {
    organization: ["read"],
    user: [],
  },
};

// Type-safe roles arrays derived from the permissions objects
export const courseRoles: CourseRole[] = Object.keys(
  coursePermissions,
) as CourseRole[];
export const organizationRoles: OrganizationRole[] = Object.keys(
  organizationPermissions,
) as OrganizationRole[];

export const DEFAULT_ROLES = {
  course: "student" as CourseRole,
  organization: "member" as OrganizationRole,
};
