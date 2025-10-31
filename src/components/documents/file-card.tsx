import convert from "convert";
import { XIcon } from "lucide-react";
import { isFileWithPreview } from "@/lib/guards";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { FilePreview } from "./file-preview";

const FileCard = ({
  file,
  progress,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
  progress?: number;
}) => {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 font-medium text-foreground/80 text-sm">
              {file.name}
            </p>
            <p className="text-muted-foreground text-xs">
              {`${convert(file.size, "bytes").to("MiB").toLocaleString()} MB`}
            </p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={onRemove}
        >
          <XIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
};

export { FileCard };
