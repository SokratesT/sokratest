import { Button } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { AddUserForm } from "@/components/users/add-user-form";
import { db } from "@/db/drizzle";
import { courses } from "@/db/schema/courses";
import { auth } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

const addUserPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeOrganizationId) {
    return <Placeholder>Please activate an organization first.</Placeholder>;
  }

  const queryCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.organizationId, session.session.activeOrganizationId))
    .orderBy(asc(courses.title));

  if (!queryCourses.length) {
    return (
      <Placeholder>
        <p>No courses found. Please create a course first.</p>
        <Button asChild variant="outline">
          <Link href={"/app/courses/add"}>Create Course</Link>
        </Button>
      </Placeholder>
    );
  }

  return <AddUserForm courses={queryCourses} />;
};

export default addUserPage;
