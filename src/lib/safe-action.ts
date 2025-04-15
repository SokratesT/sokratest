import { getSession } from "@/db/queries/auth";
import type { User } from "@/db/schema/auth";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action";
import { z } from "zod";
import {
  type Action,
  type CourseResource,
  type OrganizationResource,
  type Resource,
  hasPermission,
} from "./rbac";

class ActionError extends Error {}

const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);

    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      permission: z
        .object({
          resource: z.discriminatedUnion("context", [
            z.object({
              context: z.literal("course"),
              type: z.enum(["course", "document", "chat", "invitation"]),
            }),
            z.object({
              context: z.literal("organization"),
              type: z.enum(["organization", "post", "user"]),
              orgId: z.string().optional(),
            }),
          ]),
          action: z.enum(["read", "update", "delete", "create"]),
        })
        .optional(),
    });
  },
  // Define logging middleware.
}).use(async ({ next, clientInput, metadata }) => {
  console.log("LOGGING MIDDLEWARE");

  const startTime = performance.now();

  // Here we await the action execution.
  const result = await next();

  const endTime = performance.now();

  console.log("Result ->", result);
  console.log("Client input ->", clientInput);
  console.log("Metadata ->", metadata);
  console.log("Action execution took", endTime - startTime, "ms");

  // And then return the result of the awaited action.
  return result;
});

export const authActionClient = actionClient
  // Define authorization middleware.
  .use(async ({ next }) => {
    const session = await getSession();

    if (!session) {
      throw new Error("Session not found!");
    }

    const userId = session.session.userId;

    if (!userId) {
      throw new Error("Session is not valid!");
    }

    // Return the next middleware with `userId` value in the context
    return next({ ctx: { userId } });
  });

export const requireOrganizationMiddleware = createMiddleware<{
  ctx: { userId: User["id"] };
}>().define(async ({ next, ctx }) => {
  const session = await getSession();

  const activeOrganizationId = session?.session.activeOrganizationId;

  if (!activeOrganizationId) {
    throw new Error("No active organization");
  }

  return next({ ctx: { ...ctx, activeOrganizationId } });
});

export const requireCourseMiddleware = createMiddleware<{
  ctx: { userId: User["id"] };
}>().define(async ({ next, ctx }) => {
  const session = await getSession();

  const activeCourseId = session?.session.activeCourseId;

  if (!activeCourseId) {
    throw new Error("No active course");
  }

  return next({ ctx: { ...ctx, activeCourseId } });
});

export const checkPermissionMiddleware = createMiddleware<{
  ctx: { userId: User["id"] };
  metadata: {
    permission?: {
      resource: Omit<CourseResource, "id"> | Omit<OrganizationResource, "id">;
      action: string;
    };
  };
}>().define(async ({ next, ctx, metadata, clientInput }) => {
  const input = clientInput;

  if (!metadata.permission) {
    throw new Error("No permission metadata provided");
  }

  const { resource, action } = metadata.permission;

  let ids: string[] = [];

  if (typeof input !== "object" || input === null) {
    if (metadata.permission.action === "create" && "activeCourseId" in ctx) {
      ids = [ctx.activeCourseId as string];
    } else {
      throw new Error("Input must contain an ids array field");
    }
  } else if ("ids" in input && Array.isArray(input.ids)) {
    ids = input.ids as string[];
  } else if ("refs" in input && Array.isArray(input.refs)) {
    ids = input.refs.map((e) => e.id) as string[];
  } else if ("id" in input) {
    ids = [input.id as string];
  } else if ("courseId" in input) {
    ids = [input.courseId as string];
  } else if ("activeOrganizationId" in ctx) {
    ids = [ctx.activeOrganizationId as string];
  } else if ("chatId" in input) {
    ids = [input.chatId as string];
  } else {
    throw new Error("Unknown input");
  }

  // Check all permissions and wait for all promises to resolve
  // TODO: Quite terrible performance, needs improvement
  await Promise.all(
    ids.map(async (id) => {
      if (typeof id !== "string") {
        throw new Error("ID must be a string");
      }

      const fullResource: Resource =
        resource.context === "course"
          ? {
              ...(resource as Omit<CourseResource, "id">),
              id,
            }
          : {
              ...(resource as Omit<OrganizationResource, "id">),
              id,
            };

      if (!(await hasPermission(fullResource, action as Action))) {
        throw new Error(`Permission denied for ID: ${id}`);
      }
    }),
  );

  return next({ ctx });
});
