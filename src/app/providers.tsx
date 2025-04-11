import { NextStepCard } from "@/components/next-step/next-step-card";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConfirmDialogProvider } from "@/components/ui/dialog/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { nextStepTours } from "@/lib/next-step-tours";
import { NextStep, NextStepProvider } from "nextstepjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ConfirmDialogProvider>
        <NextStepProvider>
          <NextStep steps={nextStepTours} cardComponent={NextStepCard}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
          </NextStep>
        </NextStepProvider>
      </ConfirmDialogProvider>
    </NuqsAdapter>
  );
};

export { Providers };
