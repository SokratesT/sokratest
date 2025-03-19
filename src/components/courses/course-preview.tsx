import { Button } from "@/components/ui/button";
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
import { BookMarkedIcon } from "lucide-react";

const CoursePreview = async () => {
  const session = await getSession();

  if (!session?.session.activeCourseId) {
    return <Placeholder>Please select an active course first</Placeholder>;
  }

  const { query: course } = await getCourseById(
    session?.session.activeCourseId,
  );

  if (!course) {
    return <Placeholder>No such course</Placeholder>;
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-muted-foreground text-xs">Active Course</p>
        <CardTitle className="flex items-center gap-2">
          <BookMarkedIcon />
          {course.title}
        </CardTitle>
      </CardHeader>
      <CardContent>{course.description}</CardContent>
      <CardFooter>
        <Button>More</Button>
      </CardFooter>
    </Card>
  );
};

export { CoursePreview };
