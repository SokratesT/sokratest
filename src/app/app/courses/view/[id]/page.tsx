import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
            <Link href={`/app/courses/view/${id}/members`}>Manage Users</Link>
          </Button>
          <Button asChild>
            <Link href="/app/courses/add">Add Files</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-full lg:w-[60%]">
          <CardContent className="p-4">
            <PlateEditor options={{ value: queryCourse.content }} readOnly />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCoursePage;
