/* import {
  createParser,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs"; */

import { useQueryStates } from "nuqs";
import {
  createParser,
  createSearchParamsCache,
  parseAsInteger,
} from "nuqs/server";
import type { TransitionStartFunction } from "react";
// import { createSearchParamsCache } from "nuqs/server";

// The page index parser is zero-indexed internally,
// but one-indexed when rendered in the URL,
// to align with your UI and what users might expect.
const pageIndexParser = createParser({
  parse: (query) => {
    const page = parseAsInteger.parse(query);
    return page === null ? null : page - 1;
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value + 1);
  },
});

const paginationParsers = (startTransition?: TransitionStartFunction) => ({
  pageIndex: pageIndexParser
    .withDefault(0)
    .withOptions({ shallow: false, startTransition }),
  pageSize: parseAsInteger.withDefault(10).withOptions({ shallow: false }),
});

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

export const paginationSearchParamsCache = createSearchParamsCache(
  paginationParsers(),
  {
    urlKeys: paginationUrlKeys,
  },
);

export function usePaginationSearchParams(
  startTransition: TransitionStartFunction,
) {
  return useQueryStates(paginationParsers(startTransition), {
    urlKeys: paginationUrlKeys,
  });
}
