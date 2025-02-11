"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

const spinnerVariants =
  "w-16 h-16 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin";

const LoadingSpinner = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="loading-spinner"
      className={cn(spinnerVariants, className)}
      {...props}
    />
  );
};

export { LoadingSpinner };
