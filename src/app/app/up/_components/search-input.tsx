"use client";

import { Input } from "@/components/ui/input";
import { searchParamsParser, urlKeys } from "@/lib/searchParams";
import { cn } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import { useDebouncedCallback } from "use-debounce";

const SearchInput = () => {
  const [{ search, page }, setQuery] = useQueryStates(
    searchParamsParser,
    urlKeys,
  );

  const handleSearch = useDebouncedCallback((search: string) => {
    setQuery({ search });
    if (page !== 1) {
      setQuery({ page: 1 });
    }
  }, 500);

  return (
    <Input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search files..."
      className={cn("h-8 w-full bg-background shadow-none")}
    />
  );
};

export { SearchInput };
