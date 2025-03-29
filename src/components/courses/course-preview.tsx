import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getSession } from "@/db/queries/auth";
import { getCourseById } from "@/db/queries/course";
import { ROUTES } from "@/settings/routes";
import { BookMarkedIcon } from "lucide-react";
import Link from "next/link";

const CoursePreview = async () => {
  const session = await getSession();

  if (!session?.session.activeCourseId) {
    return <Placeholder>Please select an active course first</Placeholder>;
  }

  const result = await getCourseById(session?.session.activeCourseId);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  if (!result.data.query) {
    return <Placeholder>No such course</Placeholder>;
  }

  const { id, title, description } = result.data.query;

  return (
    <Card>
      <CardHeader>
        <p className="text-muted-foreground text-xs">Active Course</p>
        <CardTitle className="flex items-center gap-2">
          <BookMarkedIcon />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter>
        <Link
          href={ROUTES.PRIVATE.courses.view.getPath({ id })}
          className={buttonVariants({ variant: "default" })}
        >
          More
        </Link>
      </CardFooter>
    </Card>
  );
};

export { CoursePreview };
