"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchParamsParser, urlKeys } from "@/lib/nuqs/search-params.bucket";
import { buckets } from "@/settings/buckets";
import { useQueryStates } from "nuqs";

const BucketSelect = () => {
  const [{ bucket }, setQuery] = useQueryStates(searchParamsParser, urlKeys);

  return (
    <Select
      value={bucket}
      onValueChange={(value) => setQuery({ bucket: value })}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Bucket" />
      </SelectTrigger>
      <SelectContent>
        {buckets.map((bucket) => (
          <SelectItem key={bucket.name} value={bucket.name}>
            {bucket.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { BucketSelect };
