import { CourseInvitationForm } from "@/components/courses/members/course-invitation-form";
import { Placeholder } from "@/components/placeholders/placeholder";
import { buttonVariants } from "@/components/ui/button";
import { getUserCoursesForActiveOrganization } from "@/db/queries/course";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { redirect } from "next/navigation";

const AddUsersPage = async () => {
  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "user" },
    "create",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  const result = await getUserCoursesForActiveOrganization({
    sort: [{ id: "title", desc: false }],
    pageIndex: 0,
    pageSize: 100,
  });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const courses = result.data.query;

  if (!courses.length) {
    return (
      <Placeholder>
        <p>No courses found. Please create a course first.</p>

        <Link
          href={ROUTES.PRIVATE.courses.add.getPath()}
          className={buttonVariants({ variant: "outline" })}
        >
          Create Course
        </Link>
      </Placeholder>
    );
  }

  return <CourseInvitationForm courses={courses} />;
};

export default AddUsersPage;
