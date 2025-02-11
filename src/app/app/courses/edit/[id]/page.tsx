import { db } from "@/db/drizzle";
import { courses } from "@/db/schema/courses";
import { eq } from "drizzle-orm";
import { CourseForm } from "../../add/_components/course-form";

const EditCoursePage = async ({
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
    <div>
      <CourseForm course={queryCourse} />
    </div>
  );
};

export default EditCoursePage;
