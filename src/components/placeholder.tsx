import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleHelpIcon, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

const Placeholder = ({
  children,
  className,
  Icon = CircleHelpIcon,
}: {
  children: ReactNode;
  className?: string;
  Icon?: LucideIcon;
}): ReactNode => {
  const size = 50;

  return (
    <Card className={cn(className, "flex h-full items-center justify-center")}>
      <CardHeader>
        <CardTitle className="text-muted-foreground">
          <div className="flex flex-col items-center gap-4">
            <Icon size={size} />
            {children}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export { Placeholder };
