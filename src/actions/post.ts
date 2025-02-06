"use server";

import { db } from "@/db/drizzle";
import { type Post, posts } from "@/db/schema/posts";
import { auth } from "@/lib/auth";
import type { PostSchemaType } from "@/lib/schemas/post";
import { routes } from "@/settings/routes";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const createPost = async (post: PostSchemaType) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.insert(posts).values({ ...post, author: session.user.id });

  revalidatePath(routes.app.sub.posts.path);
};

export const updatePost = async (post: PostSchemaType, postId: Post["id"]) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db
    .update(posts)
    .set({ ...post, author: session?.user.id, updatedAt: sql`now()` })
    .where(eq(posts.id, postId));

  revalidatePath(routes.app.sub.posts.path);
};

export const deletePosts = async (postIds: Post["id"][]) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.delete(posts).where(inArray(posts.id, postIds));

  revalidatePath(routes.app.sub.posts.path);
};
