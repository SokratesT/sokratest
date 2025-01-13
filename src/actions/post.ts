"use server";

import { db } from "@/db/drizzle";
import { posts } from "@/db/schema/posts";
import { auth } from "@/lib/auth";
import { PostSchemaType } from "@/lib/schemas/post";
import { routes } from "@/settings/routes";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const createPost = async (post: PostSchemaType) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.insert(posts).values({ ...post, author: session?.user.id });

  revalidatePath(routes.app.sub.posts.path);
};

export const updatePost = async (post: PostSchemaType, postId: string) => {
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

export const deletePost = async (postId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath(routes.app.sub.posts.path);
};
