import { useQueryStates } from "nuqs";
import { createParser, createSearchParamsCache } from "nuqs/server";

const searchParser = createParser({
  parse: (query) => query || "",
  serialize: (value) => value,
});

const searchUrlKeys = {
  search: "search",
};

const queryParsers = (startTransition?: React.TransitionStartFunction) => ({
  search: searchParser.withOptions({ shallow: false, startTransition }),
});

export const querySearchParamsCache = createSearchParamsCache(queryParsers(), {
  urlKeys: searchUrlKeys,
});

export function useQuerySearchParams(
  startTransition: React.TransitionStartFunction,
) {
  return useQueryStates(queryParsers(startTransition), {
    urlKeys: searchUrlKeys,
  });
}
