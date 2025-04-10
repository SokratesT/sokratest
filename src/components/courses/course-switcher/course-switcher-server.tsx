import { getSession } from "@/db/queries/auth";
import {
  getCourseById,
  getUserCoursesForActiveOrganization,
} from "@/db/queries/course";
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
    <CourseSwitcher
      availableCourses={result.data.query}
      activeCourse={activeCourse}
    />
  );
};

export { CourseSwitcherServer };
