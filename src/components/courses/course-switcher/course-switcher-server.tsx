import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/db/queries/auth";
import {
  getCourseById,
  getUserCoursesForActiveOrganization,
} from "@/db/queries/course";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";
import { CourseSwitcher } from "./course-switcher";

const CourseSwitcherServer = async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const result = await getUserCoursesForActiveOrganization({
    sort: [{ id: "createdAt", desc: true }],
    pageIndex: 0,
    pageSize: 100,
  });

  if (!result.success) {
    return <div>{result.error.message}</div>;
  }

  let activeCourse = undefined;

  if (session.session.activeCourseId) {
    const result = await getCourseById(session.session.activeCourseId);

    if (!result.success) {
      return <div>{result.error.message}</div>;
    }

    activeCourse = result.data.query;
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border bg-background/50 p-2">
      <CourseSwitcher
        availableCourses={result.data.query}
        activeCourse={activeCourse}
      />
      {activeCourse && (
        <div className="flex w-full items-center gap-2">
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
            href={ROUTES.PRIVATE.courses.view.getPath({ id: activeCourse.id })}
          >
            About
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
            href={ROUTES.PRIVATE.documents.root.getPath()}
          >
            Resources
          </Link>
        </div>
      )}
    </div>
  );
};

export { CourseSwitcherServer };
