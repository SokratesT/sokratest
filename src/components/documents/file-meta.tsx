import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Document } from "@/db/schema/document";
import { convert } from "convert";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, HardDrive } from "lucide-react";

const getFileTypeColor = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    pdf: "bg-red-100 text-red-800",
    doc: "bg-blue-100 text-blue-800",
    docx: "bg-blue-100 text-blue-800",
    txt: "bg-gray-100 text-gray-800",
    csv: "bg-green-100 text-green-800",
    xls: "bg-green-100 text-green-800",
    xlsx: "bg-green-100 text-green-800",
    ppt: "bg-orange-100 text-orange-800",
    pptx: "bg-orange-100 text-orange-800",
    jpg: "bg-purple-100 text-purple-800",
    png: "bg-purple-100 text-purple-800",
  };

  return typeMap[fileType.toLowerCase()] || "bg-zinc-100 text-zinc-800";
};

const formatDate = (date: Date | null): string => {
  if (!date) return "Unknown date";
  return formatDistanceToNow(date, { addSuffix: true });
};

const FileMeta = ({ document }: { document: Document }) => {
  const fileTypeColor = getFileTypeColor(document.fileType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          Metadata
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={`${fileTypeColor} font-medium text-xs uppercase`}
              >
                {document.fileType}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>File Type</TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {formatDate(document.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">
              {formatDate(document.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">
              {convert(document.size, "bytes").to("best").toString()}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="font-normal text-xs">
            {document.embeddingStatus === "done" ? "Indexed ✓" : "Indexing..."}
          </Badge>
          {document.courseId && (
            <Badge variant="outline" className="font-normal text-xs">
              Course Attached
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { FileMeta };
