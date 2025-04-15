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
import {
  updateUserCourseRole,
  updateUserOrganizationRole,
} from "@/db/actions/user";
import type { User } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { withToastPromise } from "@/lib/utils";
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
    toast.promise(authClient.admin.banUser({ userId }), {
      loading: "Banning user...",
      success: "User banned",
      error: (error) => ({
        message: "Failed to ban user",
        description: error.message,
      }),
    });

    revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
  };

  const handleUnbanUser = async (userId: string) => {
    toast.promise(authClient.admin.unbanUser({ userId }), {
      loading: "Unbanning user...",
      success: "User unbanned",
      error: (error) => ({
        message: "Failed to unban user",
        description: error.message,
      }),
    });
    revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
  };

  const handleRevokeSession = async (sessionToken: string) => {
    toast.promise(
      authClient.admin.revokeUserSession({
        sessionToken,
      }),
      {
        loading: "Revoking session...",
        success: "Session revoked",
        error: (error) => ({
          message: "Failed to revoke session",
          description: error.message,
        }),
      },
    );

    revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
  };

  const handleRoleChange = async (role: "admin" | "member") => {
    toast.promise(
      withToastPromise(updateUserOrganizationRole({ role, ids: [user.id] })),
      {
        loading: `Updating user role to ${role}...`,
        success: `User role updated to ${role}`,
        error: (error) => ({
          message: "Failed to update user role",
          description: error.message,
        }),
      },
    );

    revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
  };

  const handleCourseRoleChange = async (role: "instructor" | "student") => {
    toast.promise(
      withToastPromise(updateUserCourseRole({ role, ids: [user.id] })),
      {
        loading: "Updating user role...",
        success: "User role updated",
        error: (error) => ({
          message: "Failed to update user role",
          description: error.message,
        }),
      },
    );
  };

  const handleDeleteUser = async (userId: string) => {
    toast.promise(authClient.admin.removeUser({ userId }), {
      loading: "Deleting user...",
      success: "User deleted",
      error: (error) => ({
        message: "Failed to delete user",
        description: error.message,
      }),
    });

    revalidatePathFromClient({ path: ROUTES.PRIVATE.users.root.getPath() });
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
              onValueChange={(value) =>
                handleRoleChange(value as "admin" | "member")
              }
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
