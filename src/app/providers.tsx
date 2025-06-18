import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConfirmDialogProvider } from "@/components/ui/dialog/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UmamiTracker } from "@/components/umami/umami-tracker";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ConfirmDialogProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster
              mobilePosition="top-right"
              mobileOffset={{ top: "60px" }}
            />
            <UmamiTracker />
          </TooltipProvider>
        </ThemeProvider>
      </ConfirmDialogProvider>
    </NuqsAdapter>
  );
};

export { Providers };
