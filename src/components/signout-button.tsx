"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(routes.login.path);
        },
      },
    });
  };

  return <Button onClick={handleSignOut}>Sign Out</Button>;
};
