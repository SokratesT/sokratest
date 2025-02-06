import { PostForm } from "@/app/app/posts/add/_components/post-form";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema/posts";
import { eq } from "drizzle-orm";
import { InterceptingModal } from "./_components/intercepting-modal";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryPost] = await db.select().from(posts).where(eq(posts.id, id));

  return (
    <InterceptingModal title="Edit Post">
      <PostForm post={queryPost} />
    </InterceptingModal>
  );
};

export default EditPostPage;
