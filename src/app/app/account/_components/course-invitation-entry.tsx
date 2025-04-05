"use client";

import { Button } from "@/components/ui/button";
import { acceptCourseInvitation } from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";

const CourseInvitationEntry = ({
  invitation,
}: { invitation: CourseInvitation }) => {
  const handleAccept = async (invitation: CourseInvitation) => {
    console.log("Accepting invitation", invitation);
    const res = await acceptCourseInvitation(invitation);
    console.log(res);
  };

  return (
    <div key={invitation.id} className="rounded-md border p-4">
      <h3 className="font-semibold text-lg">{invitation.courseId}</h3>
      <p className="text-gray-500 text-sm">{invitation.status}</p>
      <Button onClick={() => handleAccept(invitation)}>Accept</Button>
    </div>
  );
};

export { CourseInvitationEntry };
