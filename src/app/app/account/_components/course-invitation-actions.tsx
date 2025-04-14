"use client";

import { Button } from "@/components/ui/button";
import {
  acceptCourseInvitation,
  rejectCourseInvitation,
} from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { withToastPromise } from "@/lib/utils";
import { toast } from "sonner";

interface CourseInvitationActionsProps {
  invitation: CourseInvitation;
}

export function CourseInvitationActions({
  invitation,
}: CourseInvitationActionsProps) {
  const handleAccept = async () => {
    toast.promise(withToastPromise(acceptCourseInvitation(invitation)), {
      loading: "Accepting invitation...",
      success: "Invitation accepted!",
      error: (error) => ({
        message: "Failed to accept invitation",
        description: error.message,
      }),
    });
  };

  const handleReject = async () => {
    toast.promise(withToastPromise(rejectCourseInvitation(invitation)), {
      loading: "Rejecting invitation...",
      success: "Invitation rejected!",
      error: (error) => ({
        message: "Failed to reject invitation",
        description: error.message,
      }),
    });
  };

  return (
    <div className="mt-2 flex gap-2">
      <Button onClick={handleAccept} variant="default" size="sm">
        Accept
      </Button>
      <Button onClick={handleReject} variant="destructive" size="sm">
        Reject
      </Button>
    </div>
  );
}
