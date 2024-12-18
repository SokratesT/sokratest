"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const PageTitle = () => {
  const [documentTitle, setDocumentTitle] = useState<string | undefined>(
    undefined,
  );
  const pathname = usePathname();

  useEffect(() => {
    setDocumentTitle(document.title);
  }, [pathname]);

  return documentTitle ? documentTitle : <Skeleton className="h-6 w-24" />;
};

export { PageTitle };
