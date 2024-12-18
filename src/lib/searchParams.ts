import { buckets } from "@/settings/buckets";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const urlKeys = {
  urlKeys: {
    page: "p",
    bucket: "b",
    search: "s",
  },
};

export const searchParamsParser = {
  page: parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  bucket: parseAsString
    .withDefault(buckets[0].name)
    .withOptions({ shallow: false }),
  search: parseAsString.withDefault("").withOptions({ shallow: false }),
};
export const searchParamsCache = createSearchParamsCache(
  searchParamsParser,
  urlKeys,
);
