import {
  getCourseById,
  getUserCoursesForActiveOrganization,
} from "@/db/queries/courses";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CourseSwitcher } from "./course-switcher";

const CourseSwitcherServer = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("No session");
  }

  // TODO: Not ideal...
  const { query } = await getUserCoursesForActiveOrganization({
    sort: [{ id: "createdAt", desc: true }],
    pageIndex: 0,
    pageSize: 100,
  });

  let activeCourse = undefined;

  if (session.session.activeCourseId) {
    const { query } = await getCourseById(session.session.activeCourseId);
    activeCourse = query;
  }

  return (
    <CourseSwitcher availableCourses={query} activeCourse={activeCourse} />
  );
};

export { CourseSwitcherServer };
