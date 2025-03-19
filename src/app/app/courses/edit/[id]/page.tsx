import { CourseForm } from "@/components/courses/course-form";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getCourseById } from "@/db/queries/course";

const EditCoursePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { query } = await getCourseById(id);

  if (!query) {
    return <Placeholder>No such course</Placeholder>;
  }

  return (
    <div>
      <CourseForm course={query} />
    </div>
  );
};

export default EditCoursePage;
