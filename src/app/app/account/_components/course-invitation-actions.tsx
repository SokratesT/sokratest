"use client";

import { Button } from "@/components/ui/button";
import {
  acceptCourseInvitation,
  rejectCourseInvitation,
} from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { toast } from "sonner";

interface CourseInvitationActionsProps {
  invitation: CourseInvitation;
}

export function CourseInvitationActions({
  invitation,
}: CourseInvitationActionsProps) {
  const handleAccept = async () => {
    toast.promise(acceptCourseInvitation(invitation), {
      loading: "Accepting invitation...",
      success: "Invitation accepted!",
      error: "Failed to accept invitation",
    });
  };

  const handleReject = async () => {
    toast.promise(rejectCourseInvitation(invitation), {
      loading: "Rejecting invitation...",
      success: "Invitation rejected!",
      error: "Failed to reject invitation",
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
