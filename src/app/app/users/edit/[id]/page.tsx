import { Placeholder } from "@/components/placeholders/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageUser } from "@/components/users/manage-user";
import {
  getUserById,
  getUserCourseMembershipById,
  getUserOrganizationMembershipById,
} from "@/db/queries/users";
import { format } from "date-fns";
import {
  BadgeIcon,
  CalendarIcon,
  ClockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

const EditUserPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await getUserById(id);
  const courseMembershipResult = await getUserCourseMembershipById(id);
  const organizationMembershipResult =
    await getUserOrganizationMembershipById(id);

  if (
    !result.success ||
    !courseMembershipResult.success ||
    !organizationMembershipResult.success
  ) {
    // FIXME: Ugly, needs improvement
    const errorMessage = !result.success
      ? result.error.message
      : !courseMembershipResult.success
        ? courseMembershipResult.error.message
        : !organizationMembershipResult.success
          ? organizationMembershipResult.error.message
          : "Unknown error occurred";
    return <Placeholder>{errorMessage}</Placeholder>;
  }

  const user = result.data.query;
  const userCourseRole = courseMembershipResult.data.query?.role ?? undefined;
  const userOrganizationRole =
    organizationMembershipResult.data.query?.role ?? undefined;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Name</p>
                <p className="text-muted-foreground text-sm">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Email</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BadgeIcon className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${user.banned ? "bg-destructive" : "bg-green-500"}`}
                  />
                  <p className="text-muted-foreground text-sm">
                    {user.banned ? "Banned" : "Active"}
                  </p>
                </div>
              </div>
            </div>

            {typeof user.emailVerified === "string" && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Email Verification</p>
                  <p className="text-muted-foreground text-sm">
                    Verified on {format(user.emailVerified, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Created At</p>
                <p className="text-muted-foreground text-sm">
                  {format(user.createdAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Updated At</p>
                <p className="text-muted-foreground text-sm">
                  {format(user.updatedAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ManageUser
        user={user}
        courseRole={userCourseRole}
        organizationRole={userOrganizationRole}
      />
    </div>
  );
};

export default EditUserPage;
