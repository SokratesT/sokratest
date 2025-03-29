import { PlateEditor } from "@/components/editor/plate-editor";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCourseById } from "@/db/queries/course";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";

const ViewCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getCourseById(id);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  if (!result.data.query) {
    return <Placeholder>No such course</Placeholder>;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {result.data.query.title}
        </h4>
        <div className="flex gap-2">
          <Link
            href={ROUTES.PRIVATE.courses.members.getPath({ id })}
            className={buttonVariants({ variant: "default" })}
          >
            Manage Users
          </Link>

          <Link
            href={ROUTES.PRIVATE.documents.add.getPath()}
            className={buttonVariants({ variant: "default" })}
          >
            Add Files
          </Link>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="max-w-full lg:w-[60%]">
          <CardContent className="p-4">
            <PlateEditor
              options={{ value: result.data.query.content }}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCoursePage;
