import { PlateEditor } from "@/components/editor/plate-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getCourseById } from "@/db/queries/courses";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";

const ViewCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { query } = await getCourseById(id);

  if (!query) {
    console.log("No course found", query);
    return <Placeholder>No such course</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {query.title}
        </h4>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={ROUTES.PRIVATE.courses.members.getPath({ id })}>
              Manage Users
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.PRIVATE.documents.add.getPath()}>Add Files</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-full lg:w-[60%]">
          <CardContent className="p-4">
            <PlateEditor options={{ value: query.content }} readOnly />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCoursePage;
