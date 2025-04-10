import { getSession } from "@/db/queries/auth";
import { getAllPosts } from "@/db/queries/post";
import Link from "next/link";

const PostsPage = async () => {
  const queryPosts = await getAllPosts();
  const session = await getSession();

  return (
    <div className="container mx-auto flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Posts
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {queryPosts.map((post) => (
          <Link href={`/blog/${post.id}`} key={post.id}>
            <div className="flex cursor-pointer flex-col gap-2 hover:opacity-75">
              <div className="mb-4 aspect-video rounded-md bg-muted" />
              <h3 className="text-xl tracking-tight">{post.title}</h3>
              <p className="text-base text-muted-foreground">
                Our goal is to streamline SMB trade, making it easier and faster
                than ever.
              </p>
              <p className="text-muted-foreground text-sm">
                {post.createdAt?.getDate()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;
