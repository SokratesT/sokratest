"use server";

import { db } from "@/db/drizzle";
import { post } from "@/db/schema/post";
import {
  postDeleteSchema,
  postInsertSchema,
  postUpdateSchema,
} from "@/db/zod/post";
import { authActionClient, checkPermissionMiddleware } from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createPost = authActionClient
  .metadata({
    actionName: "createPost",
    permission: {
      resource: { context: "organization", type: "post" },
      action: "create",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(postInsertSchema)
  .action(async ({ parsedInput: { content, title }, ctx: { userId } }) => {
    await db.insert(post).values({ content, title, userId });

    revalidatePath(ROUTES.PRIVATE.posts.root.getPath());
    return { error: null };
  });

export const updatePost = authActionClient
  .metadata({
    actionName: "updatePost",
    permission: {
      resource: { context: "organization", type: "post" },
      action: "update",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(postUpdateSchema)
  .action(async ({ parsedInput: { id, content, title }, ctx: { userId } }) => {
    await db
      .update(post)
      .set({ content, title, userId, updatedAt: sql`now()` })
      .where(eq(post.id, id));

    revalidatePath(ROUTES.PRIVATE.posts.root.getPath());
    return { error: null };
  });

export const deletePosts = authActionClient
  .metadata({
    actionName: "deletePost",
    permission: {
      resource: { context: "organization", type: "post" },
      action: "delete",
    },
  })
  .schema(postDeleteSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    await db.delete(post).where(inArray(post.id, ids));

    revalidatePath(ROUTES.PRIVATE.posts.root.getPath());
    return { error: null };
  });
