"use client";

import { useSyncExternalStore } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.head, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  return () => observer.disconnect();
};

const PageTitle = () => {
  const documentTitle = useSyncExternalStore(
    subscribe,
    () => document.title,
    () => undefined,
  );

  return documentTitle ? documentTitle : <Skeleton className="h-6 w-24" />;
};

export { PageTitle };
