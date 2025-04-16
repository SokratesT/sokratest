import { Card, CardContent } from "@/components/ui/card";
import { getActiveOrganization, getSession } from "@/db/queries/auth";
import { getActiveCourse } from "@/db/queries/course";
import {
  BookMarkedIcon,
  Building2Icon,
  MailIcon,
  UserIcon,
} from "lucide-react";

const UserStats = async () => {
  const activeOrganization = await getActiveOrganization();
  let activeCourse = null;

  const result = await getActiveCourse();
  if (result.success) {
    activeCourse = result.data.query;
  }
  const session = await getSession();

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <UserIcon className="text-secondary" />
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="font-medium text-sm">{session?.user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MailIcon className="text-secondary" />
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="font-medium text-sm">{session?.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Building2Icon className="text-secondary" />
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Active Organisation</p>
            <p className="font-medium text-sm">
              {activeOrganization?.name || "No active organisation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BookMarkedIcon className="text-secondary" />
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Active Course</p>
            <p className="font-medium text-sm">
              {activeCourse?.title || "No active course"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserStats };
