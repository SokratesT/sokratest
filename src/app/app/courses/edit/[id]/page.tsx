import { getCourseById } from "@/db/queries/courses";
import { CourseForm } from "../../_components/course-form";

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
