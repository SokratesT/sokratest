"use client";

import { acceptCourseInvitation } from "@/db/actions/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { ROUTES } from "@/settings/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AutoAcceptInvitation = ({
  invitation,
}: { invitation: CourseInvitation }) => {
  const router = useRouter();

  useEffect(() => {
    const acceptInvitation = async () => {
      if (invitation) {
        await acceptCourseInvitation(invitation);
      }
    };

    acceptInvitation().then(() =>
      router.replace(ROUTES.PRIVATE.root.getPath()),
    );
  }, [invitation]);

  return null;
};

export { AutoAcceptInvitation };
