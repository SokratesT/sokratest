import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8",
        className,
      )}
      {...props}
    >
      <div className={cn("flex flex-col", description ? "gap-1" : "gap-0")}>
        <h1 className="font-medium text-2xl tracking-tighter md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
};

export { PageHeader };
