import { QuickActions } from "@/components/app/quick-actions";
import { UserStats } from "@/components/app/user-stats";
import { UserWelcome } from "@/components/app/user-welcome";
import { ChatsPreview } from "@/components/chat/chats-preview";
import { CoursePreview } from "@/components/courses/course-preview";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard - SokratesT",
};

const AppPage = async () => {
  return (
    <div className="space-y-8" id="tour1-step2">
      <Suspense fallback={<Skeleton className="h-[68px] w-full" />}>
        <UserWelcome />
      </Suspense>

      <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-[86px] w-full" />}>
            <CoursePreview />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[86px] w-full" />}>
            <ChatsPreview />
          </Suspense>
        </div>
        <div className="flex flex-col gap-4">
          <Suspense fallback={<Skeleton className="h-[86px] w-full" />}>
            <UserStats />
          </Suspense>

          <div className="space-y-4">
            <h2 className="font-semibold text-2xl tracking-tight">
              Quick Actions
            </h2>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
