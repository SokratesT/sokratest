"use client";

import {
  Database,
  Download,
  FileSearch,
  Loader2,
  PencilIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { enqueueDocuments, enqueueEmbeddings } from "@/db/actions/trigger-actions";
import type { Document } from "@/db/schema/document";
import { handleDeleteDocuments } from "@/lib/client-actions/document";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";

const FileActions = ({
  fileInfo,
  filePath,
  className,
}: {
  fileInfo: Document;
  filePath: string;
  className?: string;
}) => {
  const confirm = useConfirm();
  const router = useRouter();

  const isProcessing =
    fileInfo.status === "generating-embedding" ||
    fileInfo.status === "processing-document";

  return (
    <div
      className={cn(
        className,
        "flex flex-wrap items-center justify-between gap-2",
      )}
    >
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(filePath, "_blank")}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download this document</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={ROUTES.PRIVATE.documents.chunks.root.getPath({
                id: fileInfo.id,
              })}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <FileSearch className="h-4 w-4" />
                <span className="hidden sm:inline">View Chunks</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>View document chunks</TooltipContent>
        </Tooltip>
      </div>

      {/* Processing Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Process</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Processing Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isProcessing}
              onClick={() => enqueueDocuments({ ids: [fileInfo.id] })}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              Process Document
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isProcessing}
              onClick={() => enqueueEmbeddings({ ids: [fileInfo.id] })}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Generate Embedding
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          className={buttonVariants({ size: "sm", variant: "outline" })}
          href={ROUTES.PRIVATE.documents.edit.getPath({ id: fileInfo.id })}
        >
          <PencilIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </Link>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await handleDeleteDocuments({
                  confirm,
                  refs: [{ id: fileInfo.id }],
                });

                router.replace(ROUTES.PRIVATE.documents.root.getPath());
              }}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete this document</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export { FileActions };
