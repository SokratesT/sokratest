// app/providers.jsx
"use client";

import { SuspendedPostHogPageView } from "@/components/posthog/posthog-page-view";
import { clientEnv } from "@/lib/env/client";
import { posthog } from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: `https://${clientEnv.NEXT_PUBLIC_POSTHOG_HOST}`,
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      capture_performance: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
};

export { PostHogProvider };
