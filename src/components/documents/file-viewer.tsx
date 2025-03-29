"use client";

import { Placeholder } from "@/components/placeholders/placeholder";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Document } from "@/db/schema/document";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileActions } from "./file-actions";
import { FileMeta } from "./file-meta";

const FileViewer = ({ document }: { document: Document }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filePath, setFilePath] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUrl = async () => {
      const presignedUrl = await getPresignedUrl({ fileId: document.id });
      setFilePath(presignedUrl);
    };
    fetchUrl().then(() => setIsLoading(false));
  }, [document]);

  if (!filePath || isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3
          className="max-w-[80%] truncate font-semibold text-lg"
          title={document.title}
        >
          {document.title}
        </h3>
      </div>
      <div className="flex size-full flex-col gap-4 xl:grid xl:grid-cols-4">
        <div className="size-full xl:col-span-3">
          <Viewport fileType={document.fileType} filePath={filePath} />
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <FileMeta document={document} />
          <FileActions fileInfo={document} filePath={filePath} />
        </div>
      </div>
    </div>
  );
};

const Viewport = ({
  fileType,
  filePath,
  className,
}: {
  fileType: string;
  filePath: string;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  switch (fileType) {
    case "image":
      return (
        <>
          {isLoading && (
            <div className="flex size-full items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          <Card
            className={cn(
              className,
              "h-fit max-h-full w-auto items-center justify-center overflow-hidden",
              isLoading && "hidden",
            )}
          >
            <Image
              src={filePath}
              alt="test" // FIXME: Add proper alt text
              width={1000}
              height={500}
              className={cn("w-auto object-contain")}
              loading="eager"
              onLoad={() => setIsLoading(false)}
            />
          </Card>
        </>
      );
    case "pdf":
    case "video":
      return (
        <Card className="h-full overflow-hidden">
          <iframe title={filePath} src={filePath} className="size-full" />
        </Card>
      );
    default:
      return (
        <Placeholder>
          <p>This file type cannot be displayed in the browser.</p>
          <p>Please download it instead.</p>
        </Placeholder>
      );
  }
};

export { FileViewer };
