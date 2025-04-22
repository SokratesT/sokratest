import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Bot } from "lucide-react";
// Assuming you have a way to get the current user, e.g., a hook
// import { useCurrentUser } from "@/hooks/use-current-user";

const welcomeMessages = [
  "I'm ready to help you learn. What topic are you interested in today?",
  "Let's explore something new together. Ask me anything!",
  "Your learning journey continues here. How can I assist you right now?",
  "I'm here to support your studies. What challenge can we tackle?",
  "Ready to dive into some knowledge? Let me know what's on your mind.",
];

const ChatPlaceholder = () => {
  // const currentUser = useCurrentUser(); // Replace with your actual user hook/data
  const session = authClient.useSession();

  const userName = session.data?.user.name.split(" ")[0] ?? "user";

  // Select a random message
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  const message = welcomeMessages[randomIndex];

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
          <p>{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export { ChatPlaceholder };
