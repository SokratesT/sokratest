"use client";

import { deleteDocumentInfo } from "@/db/actions/document";
import { enqueueEmbeddings } from "@/db/actions/test-trigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Document } from "@/db/schema/document";
import { cn } from "@/lib/utils";
import { convert } from "convert";
import Link from "next/link";

const FileActions = ({
  fileInfo,
  filePath,
  className,
}: {
  fileInfo: Document;
  filePath: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex min-h-20 pb-0", className)}>
      <div className="flex w-full flex-wrap justify-between gap-2 p-2">
        <div className="flex flex-col justify-between">
          <p className="font-bold">{fileInfo.filename}</p>
          <div className="flex gap-4 text-muted-foreground text-sm">
            <Badge variant="outline">
              Date
              <Separator orientation="vertical" className="mx-1" />{" "}
              {fileInfo.createdAt?.getDate()}
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
            onClick={() => enqueueEmbeddings({ ids: [fileInfo.id] })}
            disabled={fileInfo.embeddingStatus === "processing"}
          >
            Generate Embedding
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteDocumentInfo({ ids: [fileInfo.id] })}
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
