import {
  CalendarIcon,
  FileTextIcon,
  HashIcon,
  ImageIcon,
  LayersIcon,
  SparklesIcon,
  TypeIcon,
} from "lucide-react";
import { Markdown } from "@/components/chat/markdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { buckets } from "@/settings/buckets";
import type { QdrantChunk } from "@/types/qdrant";
import { DisplayChunkImage } from "./display-chunk-image";

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return "bg-green-100 text-green-800";
  if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
  return "bg-zinc-100 text-zinc-800";
};

const DisplayChunk = ({ chunk }: { chunk: QdrantChunk }) => {
  const isImage = chunk.payload.source === "image";
  const wordCount = chunk.payload.text.split(" ").length;

  return (
    <Card key={chunk.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LayersIcon className="h-4 w-4 text-muted-foreground" />
            Chunk {chunk.payload.chunkIndex + 1} of {chunk.payload.chunkCount}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isImage ? "secondary" : "outline"}>
              {isImage ? (
                <ImageIcon className="mr-1 h-3 w-3" />
              ) : (
                <FileTextIcon className="mr-1 h-3 w-3" />
              )}
              {chunk.payload.source}
            </Badge>
            {chunk.score !== undefined && chunk.score !== null && (
              <Badge className={`${getScoreColor(chunk.score)} font-medium`}>
                <SparklesIcon className="mr-1 h-3 w-3" />
                {(chunk.score * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-1">
          {chunk.payload.title}
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <HashIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-medium">{chunk.payload.tokens}</span>
          </div>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Words:</span>
            <span className="font-medium">{wordCount}</span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="truncate font-medium">
              {new Date(chunk.payload.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="relative rounded-md border bg-muted/30 p-4">
          <CopyButton
            value={chunk.payload.text}
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 size-7"
            tooltipText="Copy chunk text"
            toastMessages={{
              loading: "Copying chunk...",
              success: "Chunk copied!",
              error: "Failed to copy chunk",
            }}
          />
          <Markdown>{chunk.payload.text}</Markdown>
        </div>

        {isImage && chunk.payload.file_reference && chunk.payload.file_type && (
          <div className="mt-4">
            <DisplayChunkImage
              imageRef={{
                reference: chunk.payload.file_reference,
                type: chunk.payload.file_type,
                bucket: buckets.processed.name,
                prefix: chunk.payload.document_id,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DisplayChunk };
