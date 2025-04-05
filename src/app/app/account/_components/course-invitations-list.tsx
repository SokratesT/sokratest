import { getUserCourseInvitations } from "@/db/queries/course-invitations";
import { CourseInvitationEntry } from "./course-invitation-entry";

const CourseInvitationsList = async () => {
  const result = await getUserCourseInvitations();

  if (!result.success) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl">Course Invitations</h2>
        <p className="text-gray-500 text-sm">
          You have no course invitations at this time.
        </p>
      </div>
    );
  }

  const invitations = result.data.query;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-2xl">Course Invitations</h2>
      {invitations.map((invitation) => (
        <CourseInvitationEntry key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
};
export { CourseInvitationsList };
