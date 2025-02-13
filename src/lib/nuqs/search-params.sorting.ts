import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsJson } from "nuqs/server";
import { z } from "zod";

const sortingSchema = z.array(
  z.object({
    desc: z.boolean(),
    id: z.string(),
  }),
);

const sortingUrlKeys = {
  sort: "sort",
};

const sortingParsers = (startTransition?: React.TransitionStartFunction) => ({
  sort: parseAsJson(sortingSchema.parse)
    .withDefault([{ desc: false, id: "createdAt" }])
    .withOptions({ shallow: false, startTransition }),
});

export const sortingSearchParamsCache = createSearchParamsCache(
  sortingParsers(),
  {
    urlKeys: sortingUrlKeys,
  },
);

export function useSortingSearchParams(
  startTransition: React.TransitionStartFunction,
) {
  return useQueryStates(sortingParsers(startTransition), {
    urlKeys: sortingUrlKeys,
  });
}
