import { useQueryStates } from "nuqs";
import {
  createParser,
  createSearchParamsCache,
  parseAsInteger,
} from "nuqs/server";

const pageIndexParser = createParser({
  parse: (query) => {
    const page = parseAsInteger.parse(query);
    return page === null ? null : page - 1;
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value + 1);
  },
});

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

const paginationParsers = (
  startTransition?: React.TransitionStartFunction,
) => ({
  pageIndex: pageIndexParser
    .withDefault(0)
    .withOptions({ shallow: false, startTransition }),
  pageSize: parseAsInteger.withDefault(10).withOptions({ shallow: false }),
});

export const paginationSearchParamsCache = createSearchParamsCache(
  paginationParsers(),
  {
    urlKeys: paginationUrlKeys,
  },
);

export function usePaginationSearchParams(
  startTransition: React.TransitionStartFunction,
) {
  return useQueryStates(paginationParsers(startTransition), {
    urlKeys: paginationUrlKeys,
  });
}
