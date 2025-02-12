import { db } from "@/db/drizzle";
import { courses } from "@/db/schema/courses";
import { asc, eq } from "drizzle-orm";
import { AddUserForm } from "./_components/add-user-form";
import { Placeholder } from "@/components/placeholder";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
