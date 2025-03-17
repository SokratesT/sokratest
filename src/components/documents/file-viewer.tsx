"use client";

import { Card } from "@/components/ui/card";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { FileRepository } from "@/db/schema/file-repository";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileActions } from "./file-actions";

const FileViewer = ({ fileInfo }: { fileInfo: FileRepository }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filePath, setFilePath] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUrl = async () => {
      const presignedUrl = await getPresignedUrl(fileInfo.id);
      setFilePath(presignedUrl);
    };
    fetchUrl();
    setIsLoading(false);
  }, [fileInfo]);

  if (!filePath || isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <FileActions fileInfo={fileInfo} filePath={filePath} />
      <div className="size-full">
        <Viewport fileType={fileInfo.fileType} filePath={filePath} />
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
              alt="test"
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
