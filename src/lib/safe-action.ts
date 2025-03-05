import type { User } from "@/db/schema/auth";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "./auth";

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
    const session = await auth.api.getSession({ headers: await headers() });

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
  const session = await auth.api.getSession({ headers: await headers() });

  const activeOrganizationId = session?.session.activeOrganizationId;

  if (!activeOrganizationId) {
    throw new Error("No active organization");
  }

  return next({ ctx: { ...ctx, activeOrganizationId } });
});

export const requireCourseMiddleware = createMiddleware<{
  ctx: { userId: User["id"] };
}>().define(async ({ next, ctx }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  const activeCourseId = session?.session.activeCourseId;

  if (!activeCourseId) {
    throw new Error("No active course");
  }

  return next({ ctx: { ...ctx, activeCourseId } });
});
