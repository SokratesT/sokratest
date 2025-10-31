"use client";

import Image from "next/image";
import { useState } from "react";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

const FileViewport = ({
  fileType,
  filePath,
  fileTitle,
  className,
}: {
  fileType: string;
  filePath: string;
  fileTitle?: string;
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
              alt={fileTitle || "Uploaded document preview"}
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

export { FileViewport };
