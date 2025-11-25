import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          {title}
        </h4>
        {description && (
          <span className="text-muted-foreground text-sm">{description}</span>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};

export { PageHeader };
