import { CourseForm } from "@/components/courses/course-form";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

const AddCoursePage = async () => {
  const permitted = await hasPermission(
    { context: "course", id: "all", type: "course" },
    "create",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return <CourseForm />;
};

export default AddCoursePage;
