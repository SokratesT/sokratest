import { CourseForm } from "@/components/courses/course-form";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getCourseById } from "@/db/queries/course";

const EditCoursePage = async ({
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
    <div>
      <CourseForm course={result.data.query} />
    </div>
  );
};

export default EditCoursePage;
