"use client";

import { Input } from "@/components/ui/input";
import { useBucketSearchParams } from "@/lib/nuqs/search-params.bucket";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { useDebounceCallback } from "usehooks-ts";

const SearchInput = () => {
  const [isLoading, startTransition] = useTransition();
  const [{ search, page }, setQuery] = useBucketSearchParams(startTransition);

  const handleSearch = useDebounceCallback((search: string) => {
    setQuery({ search });
    if (page !== 1) {
      setQuery({ page: 1 });
    }
  }, 500);

  return (
    <Input
      defaultValue={search}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search files..."
      className={cn("h-8 w-full bg-background shadow-none")}
    />
  );
};

export { SearchInput };
