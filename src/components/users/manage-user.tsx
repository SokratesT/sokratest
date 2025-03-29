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
import type { User } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_ROLES, organizationRoles } from "@/settings/roles";
import { ROUTES } from "@/settings/routes";
import type { Session } from "better-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ManageUser = ({ user }: { user: User }) => {
  const [sessions, setSessions] = useState<Session[] | undefined>(undefined);

  // FIXME: Wtf? Why would this need a useEffect?
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
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex gap-2">
        {!user.banned && (
          <Button variant="destructive" onClick={() => handleBanUser(user.id)}>
            Ban User
          </Button>
        )}
        {user.banned && (
          <Button onClick={() => handleUnbanUser(user.id)}>Unban User</Button>
        )}

        <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
          Delete User
        </Button>
      </div>

      <Select
        onValueChange={(value) => handleRoleChange(value)}
        defaultValue={user.role || DEFAULT_ROLES.organization}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="User role" />
        </SelectTrigger>
        <SelectContent>
          {organizationRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sessions && sessions.length > 0 ? (
        <>
          <h1 className="font-semibold">Sessions</h1>
          <ScrollArea className="max-h-96">
            <div className="flex flex-col gap-2">
              {sessions?.map((session) => (
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
        </>
      ) : (
        <Placeholder>No active sessions</Placeholder>
      )}
    </div>
  );
};

export { ManageUser };
