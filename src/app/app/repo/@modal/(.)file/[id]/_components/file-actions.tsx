"use client";

import { deleteFileInfoFromDB } from "@/actions/delete-file";
import { enqueueEmbeddings } from "@/actions/test-trigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { files } from "@/db/schema/files";
import { cn } from "@/lib/utils";
import { convert } from "convert";
import Link from "next/link";
import { useState } from "react";

const FileActions = ({
  fileInfo,
  filePath,
  className,
}: {
  fileInfo: typeof files.$inferSelect;
  filePath: string;
  className?: string;
}) => {
  const [run, setRun] = useState<{
    id: string;
    publicAccessToken: string;
  } | null>(null);

  return (
    <div className={cn("flex min-h-20 pb-0", className)}>
      <div className="flex w-full flex-wrap justify-between gap-2 p-2">
        <div className="flex flex-col justify-between">
          <p className="font-bold">{fileInfo.originalName}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">
              Date
              <Separator orientation="vertical" className="mx-1" />{" "}
              {fileInfo.createdAt}
            </Badge>
            <Badge variant="outline">
              Size
              <Separator orientation="vertical" className="mx-1" />
              {convert(fileInfo.size, "bytes").to("best").toString()}
            </Badge>
            <Badge variant="outline">
              Type
              <Separator orientation="vertical" className="mx-1" />{" "}
              {fileInfo.fileType}
            </Badge>
            <Badge variant="outline">
              Bucket
              <Separator orientation="vertical" className="mx-1" />{" "}
              {fileInfo.bucket}
            </Badge>
          </div>
        </div>
        <div className="flex h-full justify-center gap-2">
          <Button
            onClick={() => enqueueEmbeddings([fileInfo.id])}
            disabled={fileInfo.embeddingStatus === "pending"}
          >
            Generate Embedding
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteFileInfoFromDB([fileInfo.id])}
          >
            Delete
          </Button>
          <Button onClick={() => window.open(filePath, "_blank")}>
            Download
          </Button>
          <Link href={`/app/repo/file/${fileInfo.id}/chunks`}>
            <Button variant="secondary">View Chunks</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { FileActions };
