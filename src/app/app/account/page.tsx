import { UserStats } from "@/components/app/user-stats";
import { ProfileForm } from "@/components/forms/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseInvitationsList } from "./_components/course-invitations-list";

export const metadata: Metadata = {
  title: "Account",
};

const AccountPage = async () => {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Account
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Adjust your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
        <Suspense fallback={<Skeleton className="h-[86px] w-full" />}>
          <UserStats />
        </Suspense>
        <Card>
          <CardHeader>
            <CardTitle>Course Invitations</CardTitle>
            <CardDescription>Manage your course invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseInvitationsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
