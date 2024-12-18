import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";

const NavigationAuthButtons = () => {
  const {
    data: session,
    isPending, //loading state
    error, //error object
  } = authClient.useSession();

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
        <Button variant="outline" asChild>
          <Link href="/app/account">Account</Link>
        </Button>
        <Button asChild>
          <Link href="/app">Go to App</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href="/auth">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/auth">Get started</Link>
      </Button>
    </div>
  );
};

export { NavigationAuthButtons };
