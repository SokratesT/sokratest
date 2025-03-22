import { buckets } from "@/settings/buckets";
import { useQueryStates } from "nuqs";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

// TODO: Split bucket and search, remove page
const bucketUrlKeys = {
  page: "p",
  bucket: "b",
  search: "s",
};

const bucketParser = (startTransition?: React.TransitionStartFunction) => ({
  page: parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  bucket: parseAsString
    .withDefault(buckets.main.name)
    .withOptions({ shallow: false }),
  search: parseAsString.withDefault("").withOptions({ shallow: false }),
});

export const bucketSearchParamsCache = createSearchParamsCache(bucketParser(), {
  urlKeys: bucketUrlKeys,
});

export function useBucketSearchParams(
  startTransition: React.TransitionStartFunction,
) {
  return useQueryStates(bucketParser(startTransition), {
    urlKeys: bucketUrlKeys,
  });
}
