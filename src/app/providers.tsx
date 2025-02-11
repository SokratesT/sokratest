import { PostHogProvider } from "@/components/posthog/posthog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <PostHogProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </PostHogProvider>
    </NuqsAdapter>
  );
};

export { Providers };
