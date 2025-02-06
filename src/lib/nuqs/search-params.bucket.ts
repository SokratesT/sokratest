import { buckets } from "@/settings/buckets";
import { useQueryStates } from "nuqs";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import type { TransitionStartFunction } from "react";

// TODO: Split bucket and search, remove page
const bucketUrlKeys = {
  page: "p",
  bucket: "b",
  search: "s",
};

const bucketParser = (startTransition?: TransitionStartFunction) => ({
  page: parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  bucket: parseAsString
    .withDefault(buckets[0].name)
    .withOptions({ shallow: false }),
  search: parseAsString.withDefault("").withOptions({ shallow: false }),
});

export const bucketSearchParamsCache = createSearchParamsCache(bucketParser(), {
  urlKeys: bucketUrlKeys,
});

export function useBucketSearchParams(
  startTransition: TransitionStartFunction,
) {
  return useQueryStates(bucketParser(startTransition), {
    urlKeys: bucketUrlKeys,
  });
}
