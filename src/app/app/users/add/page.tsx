import { Button } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { AddUserForm } from "@/components/users/add-user-form";
import { db } from "@/db/drizzle";
import { getSession } from "@/db/queries/auth";
import { course } from "@/db/schema/course";
import { ROUTES } from "@/settings/routes";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";

const addUserPage = async () => {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    return <Placeholder>Please activate an organization first.</Placeholder>;
  }

  const queryCourses = await db
    .select()
    .from(course)
    .where(eq(course.organizationId, session.session.activeOrganizationId))
    .orderBy(asc(course.title));

  if (!queryCourses.length) {
    return (
      <Placeholder>
        <p>No courses found. Please create a course first.</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.PRIVATE.courses.add.getPath()}>Create Course</Link>
        </Button>
      </Placeholder>
    );
  }

  return <AddUserForm courses={queryCourses} />;
};

export default addUserPage;
