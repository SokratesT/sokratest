import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JSONValue } from "ai";

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
                // TODO: Probably should introduce an annotationId

                <Popover key={referenceAnnotation.fileId + i}>
                  <PopoverTrigger asChild>
                    <Button>Ref. {i + 1}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="h-72 w-[500px]">
                    <ScrollArea className="size-full">
                      <p>{referenceAnnotation.fileId}</p>
                      <p>{referenceAnnotation.similarity}</p>
                      <p className="mt-2">{referenceAnnotation.text}</p>
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
