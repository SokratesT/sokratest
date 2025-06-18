"use client";

import { useRouter } from "next/navigation";
import { type ReactElement, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
        className={cn(
          "max-h-2/3 w-full max-w-full overflow-auto lg:w-8/12",
          className,
        )}
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
