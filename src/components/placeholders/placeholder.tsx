import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleHelpIcon, type LucideIcon } from "lucide-react";

const Placeholder = ({
  children,
  className,
  Icon = CircleHelpIcon,
}: {
  children: React.ReactNode;
  className?: string;
  Icon?: LucideIcon;
}): React.ReactNode => {
  const size = 50;

  return (
    <Card className={cn(className, "flex h-full items-center justify-center")}>
      <CardHeader className="w-full">
        <CardTitle className="text-muted-foreground">
          <div className="flex flex-col items-center gap-4 text-center">
            <Icon size={size} />
            {children}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export { Placeholder };
