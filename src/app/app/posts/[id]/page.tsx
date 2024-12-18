import { desc, eq } from "drizzle-orm";
import { PostForm } from "../add/_components/post-form";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema/posts";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryPost] = await db.select().from(posts).where(eq(posts.id, id));

  return (
    <div>
      <PostForm post={queryPost} />
    </div>
  );
};

export default EditPostPage;
