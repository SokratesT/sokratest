import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useUmami() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && window.umami && session?.user?.id) {
      window.umami.identify(session.user.id, {
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session]);

  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(eventName, eventData);
    } else {
      console.warn("Umami is not yet loaded.");
    }
  };

  return { trackEvent };
}
