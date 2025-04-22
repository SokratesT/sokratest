import { AppTourButton } from "@/components/next-step/app-tour-button";
import { getSession } from "@/db/queries/auth";
import { getUserPreferences } from "@/db/queries/users";
import { CompassIcon } from "lucide-react";

const UserWelcome = async () => {
  const session = await getSession();
  const result = await getUserPreferences();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isTourCompleted =
    result.success &&
    (result.data.query.preferences?.tours?.initialTour === "completed" ||
      result.data.query.preferences?.tours?.initialTour === "skipped");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-bold text-3xl tracking-tight">
          {getTimeBasedGreeting()}, {session?.user.name?.split(" ")[0]}!
        </h1>
        <AppTourButton
          variant="ghost"
          size="sm"
          className="right-0 size-8 text-muted-foreground"
          tour="initialTour"
          autoTrigger={!isTourCompleted}
        >
          <CompassIcon />
        </AppTourButton>
      </div>
      <p className="text-muted-foreground">
        Welcome to your AI learning assistant. Start a conversation or continue
        where you left off.
      </p>
    </div>
  );
};

export { UserWelcome };
