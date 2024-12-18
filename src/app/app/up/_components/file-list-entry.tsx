"use client";

import { Badge } from "@/components/ui/badge";
import { files } from "@/db/schema/files";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const FileListEntry = ({
  fileInfo,
}: {
  fileInfo: typeof files.$inferSelect;
}) => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const isActive = id === fileInfo.id;

  return (
    <Link
      href={`/app/up/${fileInfo.id}${searchParamsString ? `?${searchParamsString}` : ""}`}
      className={cn(
        "flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        { "bg-sidebar-accent text-sidebar-accent-foreground": isActive },
      )}
    >
      <div className="flex w-full items-center gap-2 truncate whitespace-break-spaces">
        <span>{fileInfo.originalName}</span>
        <span className="ml-auto text-xs">{fileInfo.createdAt}</span>
      </div>
      {/* <span className="font-medium">{fileInfo.size}</span> */}
      {/* <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
        {fileInfo.originalName}
      </span> */}
      <Badge>{fileInfo.fileType}</Badge>
    </Link>
  );
};

export { FileListEntry };
