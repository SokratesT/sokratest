"use client";

import { Placeholder } from "@/components/placeholders/placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidatePathFromClient } from "@/db/actions/revalidate-helper";
import { updateUserRole } from "@/db/actions/user";
import type { User } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_ROLES } from "@/settings/roles";
import { ROUTES } from "@/settings/routes";
import type { Session } from "better-auth";
import { KeyIcon, ShieldIcon, UserCogIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ManageUser = ({
  user,
  courseRole,
  organizationRole,
}: {
  user: User;
  courseRole: string;
  organizationRole: string;
}) => {
  const [sessions, setSessions] = useState<Session[] | undefined>(undefined);

  useEffect(() => {
    const getSessions = async () => {
      const sessions = await authClient.admin.listUserSessions({
        userId: user.id,
      });

      setSessions(sessions.data?.sessions);
    };

    getSessions();
  }, []);

  const handleBanUser = async (userId: string) => {
    const res = await authClient.admin.banUser({ userId });

    if (res.error) {
      toast.error(`Failed to ban user: ${res.error.message}`);
    } else {
      toast.success("User banned");
      revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const res = await authClient.admin.unbanUser({ userId });

    if (res.error) {
      toast.error(`Failed to unban user: ${res.error.message}`);
    } else {
      toast.success("User unbanned");
      revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    const res = await authClient.admin.revokeUserSession({
      sessionToken,
    });

    if (res.error) {
      toast.error(`Failed to revoke session: ${res.error.message}`);
    } else {
      toast.success("Session revoked");
      revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
    }
  };

  const handleRoleChange = async (role: string) => {
    const res = await authClient.admin.setRole({
      userId: user.id,
      role,
    });

    if (res.error) {
      toast.error(`Failed to update user role: ${res.error.message}`);
    } else {
      toast.success("User role updated");
      revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
    }
  };

  const handleCourseRoleChange = async (role: "instructor" | "student") => {
    toast.promise(updateUserRole({ role, ids: [user.id] }), {
      loading: "Updating user role...",
      success: "User role updated",
      error: "Failed to update user role",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await authClient.admin.removeUser({ userId });

    if (res.error) {
      toast.error(`Failed to delete user: ${res.error.message}`);
    } else {
      toast.success("User deleted");
      revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCogIcon className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {!user.banned && (
              <Button
                variant="destructive"
                onClick={() => handleBanUser(user.id)}
              >
                Ban User
              </Button>
            )}
            {user.banned && (
              <Button onClick={() => handleUnbanUser(user.id)}>
                Unban User
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(user.id)}
            >
              Delete User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-primary" />
            User Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="mb-2 font-medium text-sm">Organization Role</p>
            <Select
              onValueChange={(value) => handleRoleChange(value)}
              defaultValue={organizationRole || DEFAULT_ROLES.organization}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="User organization role" />
              </SelectTrigger>
              <SelectContent>
                {["admin", "member"].map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-2 font-medium text-sm">Course Role</p>
            <Select
              onValueChange={(value) =>
                handleCourseRoleChange(value as "instructor" | "student")
              }
              defaultValue={courseRole || DEFAULT_ROLES.course}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="User course role" />
              </SelectTrigger>
              <SelectContent>
                {["instructor", "student"].map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-primary" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <ScrollArea className="max-h-96">
              <div className="flex flex-col gap-2">
                {sessions?.map((session) => (
                  <Card key={session.id} className="border-muted">
                    <CardHeader className="pt-3 pb-1">
                      <CardTitle className="text-sm">
                        {new Date(session.createdAt).toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 gap-1 pb-2">
                        <p className="text-muted-foreground text-xs">
                          ID: {session.id}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Agent: {session.userAgent}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          IP: {session.ipAddress}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeSession(session.token)}
                      >
                        Revoke Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Placeholder>No active sessions</Placeholder>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { ManageUser };
