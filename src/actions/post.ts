"use server";

import { db } from "@/db/drizzle";
import { post } from "@/db/schema/post";
import { authActionClient } from "@/lib/safe-action";
import {
  postDeleteSchema,
  postInsertSchema,
  postUpdateSchema,
} from "@/lib/schemas/post";
import { routes } from "@/settings/routes";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createPost = authActionClient
  .metadata({ actionName: "createPost" })
  .schema(postInsertSchema)
  .action(async ({ parsedInput: { content, title }, ctx: { userId } }) => {
    await db.insert(post).values({ content, title, userId });

    revalidatePath(routes.app.sub.posts.path);
    return { error: null };
  });

export const updatePost = authActionClient
  .metadata({ actionName: "updatePost" })
  .schema(postUpdateSchema)
  .action(async ({ parsedInput: { id, content, title }, ctx: { userId } }) => {
    await db
      .update(post)
      .set({ content, title, userId, updatedAt: sql`now()` })
      .where(eq(post.id, id));

    revalidatePath(routes.app.sub.posts.path);
    return { error: null };
  });

export const deletePosts = authActionClient
  .metadata({ actionName: "deletePost" })
  .schema(postDeleteSchema)
  .action(async ({ parsedInput: { ids } }) => {
    await db.delete(post).where(inArray(post.id, ids));

    revalidatePath(routes.app.sub.posts.path);
    return { error: null };
  });
