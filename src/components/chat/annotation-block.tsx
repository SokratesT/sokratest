import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { JSONValue } from "ai";
import { Markdown } from "./markdown";

interface BaseAnnotation {
  type: string;
}

interface AnnotationReference extends BaseAnnotation {
  name: string;
  similarity: number;
  text: string;
  fileId: string;
  type: "reference";
}

const AnnotationBlock = ({ annotations }: { annotations: JSONValue[] }) => {
  return (
    <div className="mt-4">
      <p className="font-bold">Annotations</p>
      <div className="flex flex-wrap gap-2">
        {annotations.map((annotation, i) => {
          // FIXME: Bit awkward. Check if there's a better way to do this.
          const typedAnnotation = annotation as unknown as BaseAnnotation;

          switch (typedAnnotation.type) {
            case "reference": {
              const referenceAnnotation =
                typedAnnotation as AnnotationReference;
              return (
                // TODO: Add annotationId instead of this
                <Popover
                  key={
                    referenceAnnotation.fileId + referenceAnnotation.similarity
                  }
                >
                  <PopoverTrigger asChild>
                    <Button>Ref. {i + 1}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="h-72 w-[500px]">
                    <ScrollArea className="size-full">
                      <div className="rounded-md bg-muted p-4">
                        <p>
                          <b>ID:</b> {referenceAnnotation.fileId}
                        </p>
                        <p>
                          <b>Similarity:</b> {referenceAnnotation.similarity}
                        </p>
                      </div>
                      <div className="mt-4">
                        <p>
                          <b>Chunk</b>
                        </p>
                        <Separator orientation="horizontal" className="mx-1" />
                        <Markdown>{referenceAnnotation.text}</Markdown>
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export { AnnotationBlock };
