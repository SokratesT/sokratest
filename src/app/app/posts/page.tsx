import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { posts } from "@/db/schema/posts";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { PostActions } from "./add/_components/post-actions";

const PostsPage = async () => {
  const query = await db
    .select()
    .from(posts)
    .orderBy(asc(posts.createdAt))
    .leftJoin(user, eq(posts.author, user.id));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-regular max-w-xl text-3xl tracking-tighter md:text-5xl">
          Posts
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/blog">View Posts</Link>
          </Button>
          <Button asChild>
            <Link href="/app/posts/add">Add Post</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {query.map((q) => (
          <Card key={q.posts.id}>
            <CardHeader>
              <CardTitle>{q.posts.title}</CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="text-sm text-muted-foreground"
                >
                  {q.posts.createdAt}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm text-muted-foreground"
                >
                  {q.user?.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <PostActions post={q.posts} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;
