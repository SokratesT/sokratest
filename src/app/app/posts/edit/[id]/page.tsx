import { eq } from "drizzle-orm";
import { PostForm } from "@/app/app/posts/add/_components/post-form";
import { db } from "@/db/drizzle";
import { post } from "@/db/schema/post";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryPost] = await db.select().from(post).where(eq(post.id, id));

  return (
    <div>
      <PostForm post={queryPost} />
    </div>
  );
};

export default EditPostPage;
