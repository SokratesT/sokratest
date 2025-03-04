import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Building2Icon, MailIcon, UserIcon } from "lucide-react";
import { headers } from "next/headers";

const UserStats = async () => {
  const activeOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-6">
        <div className="flex items-center gap-2">
          <UserIcon />
          <div className="space-y-0.5">
            <p className="font-medium text-sm">User</p>
            <p className="text-muted-foreground text-xs">
              {session?.user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MailIcon />
          <div className="space-y-0.5">
            <p className="font-medium text-sm">Email</p>
            <p className="text-muted-foreground text-xs">
              {session?.user.email}
            </p>
          </div>
        </div>

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
  );
};

export { UserStats };
