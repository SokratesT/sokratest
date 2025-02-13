import { PlateEditor } from "@/components/editor/plate-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { posts } from "@/db/schema/posts";
import { eq } from "drizzle-orm";
import { UserIcon } from "lucide-react";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryPost] = await db.select().from(posts).where(eq(posts.id, id));
  const [author] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, queryPost.author));

  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-8 py-10 lg:py-20">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              <UserIcon className="size-4" /> {author.name}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
              {queryPost.title}
            </h1>
            <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">Created: {queryPost.createdAt}</Badge>
              <Badge variant="outline">Updated: {queryPost.updatedAt}</Badge>
            </div>
          </div>
        </div>
      </div>
      <Card className="mx-auto max-w-full lg:max-w-[60%]">
        <CardContent className="p-4">
          <PlateEditor options={{ value: queryPost.html }} readOnly />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPostPage;
