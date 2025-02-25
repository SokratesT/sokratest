import { ChatsList } from "@/components/app/chats-list";
import { QuickActions } from "@/components/app/quick-actions";
import { UserStats } from "@/components/app/user-stats";
import { UserWelcome } from "@/components/app/user-welcome";
import { AppTourButton } from "@/components/next-step/app-tour-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserChatsForActiveCourse } from "@/db/queries/chats";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard - SokratesT",
};

export default async function App() {
  // TODO: Probably want to move this out to also wrap in suspense
  const query = await getUserChatsForActiveCourse();

  return (
    <div className="space-y-8" id="tour1-step2">
      <Suspense fallback={<Skeleton className="h-[68px] w-full" />}>
        <UserWelcome />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[86px] w-full" />}>
        <UserStats />
      </Suspense>

      <div className="mt-20 grid grid-cols-4 gap-4">
        <div className="col-span-3 space-y-4">
          <h2 className="font-semibold text-2xl tracking-tight">
            Your Recent Conversations
          </h2>
          <ChatsList chats={query} />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-2xl tracking-tight">
            Quick Actions
          </h2>
          <QuickActions />
        </div>
      </div>
      <AppTourButton />
    </div>
  );
}
