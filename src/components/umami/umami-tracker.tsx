"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

// Extend Window interface to include Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      identify: (userData: Record<string, unknown>) => void;
    };
  }
}

const UmamiTracker = () => {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.email && window.umami) {
      window.umami.identify({
        id: session.user.id,
      });
    }
  }, [session]);

  return null;
};

export { UmamiTracker };
