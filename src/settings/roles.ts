import type {
  Action,
  CourseResourceType,
  OrganizationResourceType,
} from "@/lib/rbac";

// Define role types
// TODO: Make enum from PG
export type CourseRole = "instructor" | "student" | "guest";
export type OrganizationRole = "owner" | "manager" | "member" | "guest";

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
    course: ["read", "write", "delete"],
    document: ["read", "write", "delete"],
    chat: ["read", "write", "delete"],
  },
  student: {
    course: ["read"],
    document: ["read"],
    chat: ["read", "write", "delete"],
  },
  guest: {
    course: [],
    document: [],
    chat: [],
  },
};

export const organizationPermissions: OrganizationRolePermissions = {
  owner: {
    organization: ["read", "write", "delete"],
    post: ["read", "write", "delete"],
    user: ["read", "write", "delete"],
  },
  manager: {
    organization: ["read", "write"],
    post: ["read", "write", "delete"],
    user: ["read", "write", "delete"],
  },
  member: {
    organization: ["read"],
    post: ["read"],
    user: [],
  },
  guest: {
    organization: [],
    post: [],
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
