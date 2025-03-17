import { CourseForm } from "@/components/courses/course-form";
import { getCourseById } from "@/db/queries/courses";

const EditCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { query } = await getCourseById(id);

  return (
    <div>
      <CourseForm course={query} />
    </div>
  );
};

export default EditCoursePage;
