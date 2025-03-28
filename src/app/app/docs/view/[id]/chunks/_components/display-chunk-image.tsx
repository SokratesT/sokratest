"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { cn } from "@/lib/utils";
import type { BucketName } from "@/settings/buckets";
import type { FileType } from "@/types/file";
import Image from "next/image";
import { useEffect, useState } from "react";

const DisplayChunkImage = ({
  imageRef,
}: {
  imageRef: {
    reference: string;
    type: FileType;
    bucket: BucketName;
    prefix: string;
  };
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filePath, setFilePath] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUrl = async () => {
      const presignedUrl = await getPresignedUrl({
        fileId: imageRef.reference,
        prefix: imageRef.prefix,
        bucket: imageRef.bucket,
        type: imageRef.type,
      });
      setFilePath(presignedUrl);
    };
    fetchUrl().then(() => setIsLoading(true));
  }, [imageRef]);

  if (!filePath) return null;

  return (
    <div className="max-h-[100px] w-full">
      {isLoading && <Skeleton className="h-[100px] w-full" />}
      <Image
        src={filePath}
        alt="test"
        width={100}
        height={100}
        className={cn("w-auto object-contain")}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export { DisplayChunkImage };
