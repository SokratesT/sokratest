import { NextStepCard } from "@/components/next-step/next-step-card";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { nextStepTours } from "@/lib/next-step-tours";
import { NextStep, NextStepProvider } from "nextstepjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      {/* <PostHogProvider> */}
      <NextStepProvider>
        <NextStep steps={nextStepTours} cardComponent={NextStepCard}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NextStep>
      </NextStepProvider>
      {/* </PostHogProvider> */}
    </NuqsAdapter>
  );
};

export { Providers };
