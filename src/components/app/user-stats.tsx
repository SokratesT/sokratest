import { Card, CardContent } from "@/components/ui/card";
import { getActiveCourse } from "@/db/queries/courses";
import { auth } from "@/lib/auth";
import {
  BookMarkedIcon,
  Building2Icon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { headers } from "next/headers";

const UserStats = async () => {
  const activeOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { query: activeCourse } = await getActiveCourse();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <UserIcon />
            <div className="space-y-0.5">
              <p className="font-medium text-sm">User</p>
              <p className="text-muted-foreground text-xs">
                {session?.user.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <MailIcon />
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Email</p>
              <p className="text-muted-foreground text-xs">
                {session?.user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <BookMarkedIcon />
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Course</p>
              <p className="text-muted-foreground text-xs">
                {activeCourse.title || "No active course"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Building2Icon />
            <div className="space-y-0.5">
              <p className="font-medium text-sm">Organisation</p>
              <p className="text-muted-foreground text-xs">
                {activeOrganization?.name || "No active organisation"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { UserStats };
