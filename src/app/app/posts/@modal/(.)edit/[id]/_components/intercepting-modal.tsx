"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { type ReactElement, useState } from "react";

const InterceptingModal = ({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title: string;
  className?: ReactElement<HTMLDivElement>["props"]["className"];
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = () => {
    setIsOpen(false);
    router.back();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-h-full w-6/12 max-w-full overflow-auto", className)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export { InterceptingModal };
