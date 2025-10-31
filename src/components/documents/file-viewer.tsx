"use client";

import { SmartphoneIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Placeholder } from "@/components/placeholders/placeholder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Document } from "@/db/schema/document";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { cn } from "@/lib/utils";
import { FileActions } from "./file-actions";
import { FileMeta } from "./file-meta";
import { FileViewport } from "./file-viewport";

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

  const isMobile = useIsMobile();

  if (!filePath || isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-110px)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3
          className="max-w-[80%] truncate font-semibold text-lg"
          title={document.title}
        >
          {document.title}
        </h3>
      </div>
      <div
        className={cn(
          "flex size-full flex-col gap-4 xl:grid xl:grid-cols-4",
          isMobile && "flex-col-reverse",
        )}
      >
        <div className="size-full xl:col-span-3">
          {isMobile ? (
            <Placeholder Icon={SmartphoneIcon} size={30}>
              Document preview is not available on mobile.
            </Placeholder>
          ) : (
            <FileViewport
              fileType={document.fileType}
              filePath={filePath}
              fileTitle={document.title}
            />
          )}
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <FileMeta document={document} />
          <FileActions fileInfo={document} filePath={filePath} />
        </div>
      </div>
    </div>
  );
};

export { FileViewer };
