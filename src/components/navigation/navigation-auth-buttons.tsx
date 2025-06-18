"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";

const NavigationAuthButtons = () => {
  const { data: session, isPending } = authClient.useSession();

  const [isClient, setIsClient] = useState(false);

  // TODO: Feels janky, should be a better way to do this
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isPending || !isClient) {
    return <Skeleton className="h-9 w-44 rounded-lg" />;
  }

  if (session?.session) {
    return (
      <div className="flex gap-2">
        <Link
          href={ROUTES.PRIVATE.app.account.getPath()}
          className={buttonVariants({ variant: "outline" })}
        >
          Account
        </Link>

        <Link
          href={ROUTES.PRIVATE.root.getPath()}
          className={buttonVariants({ variant: "default" })}
        >
          Go to App
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href={ROUTES.PUBLIC.login.getPath()}
        className={buttonVariants({ variant: "outline" })}
      >
        Sign in
      </Link>

      <Link
        href={ROUTES.PUBLIC.signup.getPath()}
        className={buttonVariants({ variant: "default" })}
      >
        Get started
      </Link>
    </div>
  );
};

export { NavigationAuthButtons };
