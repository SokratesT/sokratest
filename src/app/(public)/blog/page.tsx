import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema/posts";
import { auth } from "@/lib/auth";
import { routes } from "@/settings/routes";
import { asc } from "drizzle-orm";
import { MoveRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

const PostsPage = async () => {
  const queryPosts = await db
    .select()
    .from(posts)
    .orderBy(asc(posts.createdAt));

  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="container mx-auto flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-regular max-w-xl text-3xl tracking-tighter md:text-5xl">
          Posts
        </h4>
        {session && session.user.role === "admin" && (
          <Link href={routes.app.sub.posts.path}>
            <Button className="gap-4">
              Manage Posts <MoveRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {queryPosts.map((post) => (
          <Link href={`/blog/${post.id}`} key={post.id}>
            <div className="flex cursor-pointer flex-col gap-2 hover:opacity-75">
              <div className="mb-4 aspect-video rounded-md bg-muted"></div>
              <h3 className="text-xl tracking-tight">{post.title}</h3>
              <p className="text-base text-muted-foreground">
                Our goal is to streamline SMB trade, making it easier and faster
                than ever.
              </p>
              <p className="text-sm text-muted-foreground">{post.createdAt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;
