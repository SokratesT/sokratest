"use client";

import { Bot } from "lucide-react";
import { useState } from "react";
import { useIsClient } from "usehooks-ts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const welcomeMessages = [
  "Let me support you on your learning journey. I am ready for you to initiate our conversation.",
  "Let me support you on your learning journey. What challenge can we tackle?",
];

const ChatPlaceholder = () => {
  const session = authClient.useSession();

  const userName = session.data?.user.name.split(" ")[0] ?? "user";

  // Picked on the client only, so the server render cannot mismatch it
  const isClient = useIsClient();
  const [message] = useState(
    () => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
  );

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex flex-row items-center gap-4 rounded-full bg-primary/10 p-3 text-primary">
            <Bot size={40} strokeWidth={1.5} />
            <span className="font-semibold text-2xl">Welcome, {userName}!</span>
          </div>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>{isClient && message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export { ChatPlaceholder };
