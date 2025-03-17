"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBucketSearchParams } from "@/lib/nuqs/search-params.bucket";
import { buckets } from "@/settings/buckets";
import { useTransition } from "react";

const BucketSelect = () => {
  const [isLoading, startTransition] = useTransition();
  const [{ bucket }, setQuery] = useBucketSearchParams(startTransition);

  return (
    <Select
      value={bucket}
      onValueChange={(value) => setQuery({ bucket: value })}
      disabled={isLoading}
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
