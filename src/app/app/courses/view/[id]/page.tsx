import { format } from "date-fns";
import { BotIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { PlateEditor } from "@/components/editor/plate-editor";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCourseById } from "@/db/queries/course";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";

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

  const hasCourseEditPermission = await hasPermission(
    { context: "course", id, type: "course" },
    "update",
  );

  const course = result.data.query;

  return (
    <div className="flex flex-col gap-14">
      <PageHeader
        title={course.title}
        actions={
          hasCourseEditPermission && (
            <>
              <Link
                href={ROUTES.PRIVATE.documents.add.getPath()}
                className={buttonVariants({ variant: "default" })}
              >
                Add Resources
              </Link>
              <Link
                href={ROUTES.PRIVATE.courses.edit.getPath({ id: course.id })}
                className={buttonVariants({ variant: "default" })}
              >
                Edit Course
              </Link>
            </>
          )
        }
      />

      <div className="flex gap-2">
        <Badge>
          <BotIcon className="mr-1" /> {course.config.model}
        </Badge>
        <Badge>
          <CalendarIcon className="mr-1" />{" "}
          {format(course.createdAt ?? "", "MMM dd, yyyy")}
        </Badge>
      </div>

      <div className="flex justify-center">
        <PlateEditor options={{ value: course.content }} readOnly />
      </div>
    </div>
  );
};

export default ViewCoursePage;
