import { auth } from "@/lib/auth";
import type { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";

type User = typeof authClient.$Infer.Session.user;

const UserWelcome = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-2">
      <h1 className="font-bold text-3xl tracking-tight">
        {getTimeBasedGreeting()}, {session?.user.name?.split(" ")[0]}!
      </h1>
      <p className="text-muted-foreground">
        Welcome to your AI learning assistant. Start a conversation or continue
        where you left off.
      </p>
    </div>
  );
};

export { UserWelcome };
