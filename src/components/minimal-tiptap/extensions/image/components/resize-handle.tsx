import { cn } from "@/lib/utils";
import * as React from "react";

interface ResizeProps extends React.HTMLAttributes<HTMLDivElement> {
  isResizing?: boolean;
}

export const ResizeHandle = React.forwardRef<HTMLDivElement, ResizeProps>(
  ({ className, isResizing = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          "-translate-y-1/2 absolute top-1/2 h-10 max-h-full w-1.5 transform cursor-col-resize rounded border border-[var(--mt-transparent-foreground)] border-solid bg-[var(--mt-bg-secondary)] p-px transition-all",
          "opacity-0 [backdrop-filter:saturate(1.8)_blur(20px)]",
          {
            "opacity-80": isResizing,
            "group-hover/node-image:opacity-80": !isResizing,
          },
          "before:-left-1 before:-right-1 before:absolute before:inset-y-0",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

ResizeHandle.displayName = "ResizeHandle";
