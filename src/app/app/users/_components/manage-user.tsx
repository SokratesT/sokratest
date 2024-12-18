"use client";

import { revalidatePathFromClient } from "@/actions/revalidate-helper";
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
import { authClient } from "@/lib/auth-client";
import { DEFAULT_ROLE, roles } from "@/settings/roles";
import { routes } from "@/settings/routes";
import { Session } from "better-auth";
import { UserWithRole } from "better-auth/plugins";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ManageUser = ({ user }: { user: UserWithRole }) => {
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
      toast.error("Failed to ban user: " + res.error.message);
    } else {
      toast.success("User banned");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const res = await authClient.admin.unbanUser({ userId });

    if (res.error) {
      toast.error("Failed to unban user: " + res.error.message);
    } else {
      toast.success("User unbanned");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    const res = await authClient.admin.revokeUserSession({
      sessionToken,
    });

    if (res.error) {
      toast.error("Failed to revoke session: " + res.error.message);
    } else {
      toast.success("Session revoked");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  const handleRoleChange = async (role: string) => {
    console.log(role);

    const res = await authClient.admin.setRole({
      userId: user.id,
      role,
    });

    if (res.error) {
      toast.error("Failed to update user role: " + res.error.message);
    } else {
      toast.success("User role updated");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await authClient.admin.removeUser({ userId });

    if (res.error) {
      toast.error("Failed to delete user: " + res.error.message);
    } else {
      toast.success("User deleted");
      revalidatePathFromClient(routes.app.sub.users.path);
    }
  };

  return (
    <div>
      {!user.banned && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleBanUser(user.id)}
        >
          Ban User
        </Button>
      )}
      {user.banned && (
        <Button size="sm" onClick={() => handleUnbanUser(user.id)}>
          Unban User
        </Button>
      )}

      <Select
        onValueChange={(value) => handleRoleChange(value)}
        defaultValue={user.role || DEFAULT_ROLE}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="User role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.slug} value={role.slug}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <h1 className="font-semibold">Sessions</h1>
      <ScrollArea className="max-h-96">
        <div className="flex flex-col gap-2">
          {sessions &&
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader className="text-sm">
                  <CardTitle>{session.createdAt.toISOString()}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>ID: {session.id}</p>
                  <p>Agent: {session.userAgent}</p>
                  <p>IP: {session.ipAddress}</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRevokeSession(session.token)}
                  >
                    Revoke
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </ScrollArea>
      <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
        Delete User
      </Button>
    </div>
  );
};

export { ManageUser };
