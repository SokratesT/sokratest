"use client";

import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AppTourButton = ({
  tour,
  autoTrigger = false,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: {
  tour: "initialTour" | "chatTour";
  autoTrigger?: boolean;
} & React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const { startNextStep } = useNextStep();

  const handleStartTour = () => {
    startNextStep(tour);
  };

  useEffect(() => {
    if (autoTrigger) {
      startNextStep(tour);
    }
  }, [autoTrigger]);

  // TODO: Expose props for customizing the button
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      onClick={handleStartTour}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { AppTourButton };
