"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { searchParamsParser, urlKeys } from "@/lib/searchParams";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

const DefaultPagination = ({ maxPage }: { maxPage: number }) => {
  const [{ page }, setQuery] = useQueryStates(searchParamsParser, urlKeys);

  const handleForward = (diff: number) => {
    if (page < maxPage) {
      setQuery({ page: page + diff });
    }
  };

  const handleBack = (diff: number) => {
    if (page > 1) {
      setQuery({ page: page - diff });
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            onClick={() => handleBack(1)}
            size="icon"
            variant="outline"
            disabled={page <= 1}
          >
            <ChevronLeftIcon />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button size="icon" variant="outline">
            {page}
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            onClick={() => handleForward(1)}
            size="icon"
            variant="outline"
            disabled={page === maxPage}
          >
            <ChevronRightIcon />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { DefaultPagination };
