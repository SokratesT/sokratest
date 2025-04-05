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
        const res = await acceptCourseInvitation(invitation);
        console.log(res);
      }
    };

    acceptInvitation().then(() =>
      router.replace(ROUTES.PRIVATE.root.getPath()),
    );
  }, [invitation]);

  return null;
};

export { AutoAcceptInvitation };
