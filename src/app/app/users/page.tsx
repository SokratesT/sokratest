import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { roles } from "@/settings/roles";
import { headers } from "next/headers";
import { ManageUser } from "./_components/manage-user";

const UsersPage = async () => {
  const users = await authClient.admin.listUsers({
    query: {
      limit: 10,
    },
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-regular max-w-xl text-3xl tracking-tighter md:text-5xl">
          Users
        </h4>
        <div className="flex gap-2">
          <Button>Add User</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {users.data &&
          users.data.users.map((user) => (
            <Card className="flex items-center justify-between" key={user.id}>
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Badge variant="outline" className="w-fit">
                  {roles.find((role) => role.slug === user.role)?.name}
                </Badge>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Manage</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Managing: {user.name}</DialogTitle>
                      <DialogDescription>
                        You are managing a user. Take various actions.
                      </DialogDescription>
                    </DialogHeader>
                    <ManageUser user={user} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default UsersPage;
