import { AutoAcceptInvitation } from "@/components/app/auto-accept-invitation";
import { getCourseInvitationById } from "@/db/queries/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const AppPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ inv: string | undefined }>;
}) => {
  const { inv } = await searchParams;

  let invitation: CourseInvitation | undefined;

  if (inv) {
    const { query } = await getCourseInvitationById(inv);
    invitation = query;
  } else {
    redirect(ROUTES.PRIVATE.root.getPath());
  }

  return (
    <div>
      {invitation && (
        <Suspense>
          <AutoAcceptInvitation invitation={invitation} />
        </Suspense>
      )}
    </div>
  );
};

export default AppPage;
