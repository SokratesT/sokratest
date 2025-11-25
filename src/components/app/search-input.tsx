"use client";

import { useTransition } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Input } from "@/components/ui/input";
import { usePaginationSearchParams } from "@/lib/nuqs/search-params.pagination";
import { useQuerySearchParams } from "@/lib/nuqs/search-params.search";
import { cn } from "@/lib/utils";

const SearchInput = ({
  type,
  placeholder,
  className,
  ...props
}: React.ComponentProps<"input">) => {
  const [, startTransition] = useTransition();
  const [{ search }, setQuery] = useQuerySearchParams(startTransition);
  const [{ pageIndex }, setPageIndexQuery] =
    usePaginationSearchParams(startTransition);

  const handleSearch = useDebounceCallback((search: string) => {
    setQuery({ search });
    if (pageIndex !== 0) {
      setPageIndexQuery({ pageIndex: 0 });
    }
  }, 500);

  return (
    <Input
      type={type}
      defaultValue={search}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder={placeholder || "Search..."}
      className={cn("h-8 max-w-[300px]", className)}
      {...props}
    />
  );
};

export { SearchInput };
