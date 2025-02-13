import { Markdown } from "@/app/app/chat/_components/markdown";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";
import Link from "next/link";

const ViewCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id));

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {queryCourse.title}
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/courses/add">Add Files</Link>
          </Button>
        </div>
      </div>
      <div>
        <Markdown>{queryCourse.content}</Markdown>
      </div>
    </div>
  );
};

export default ViewCoursePage;
