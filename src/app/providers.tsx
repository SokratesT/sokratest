import { PostHogProvider } from "@/components/posthog/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <PostHogProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </PostHogProvider>
    </NuqsAdapter>
  );
};

export { Providers };
