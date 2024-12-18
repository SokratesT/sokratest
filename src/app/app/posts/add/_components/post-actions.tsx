"use client";

import { deletePost } from "@/actions/post";
import { Button } from "@/components/ui/button";
import { posts } from "@/db/schema/posts";
import { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { toast } from "sonner";

const PostActions = ({ post }: { post: InferSelectModel<typeof posts> }) => {
  const handleDelete = async () => {
    deletePost(post.id);
    toast.success("Post deleted");
  };

  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href={`/app/posts/${post.id}`}>Edit Post</Link>
      </Button>
      <Button variant="destructive" onClick={() => handleDelete()}>
        Delete Post
      </Button>
    </div>
  );
};

export { PostActions };
