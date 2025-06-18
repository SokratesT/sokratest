import { redirect } from "next/navigation";
import { CourseForm } from "@/components/courses/course-form";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";

const AddCoursePage = async () => {
  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "organization" },
    "update",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return <CourseForm />;
};

export default AddCoursePage;
