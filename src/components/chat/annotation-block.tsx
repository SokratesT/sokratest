"use client";

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

interface BaseAnnotation extends Record<string, JSONValue> {
  type: string;
}

interface AnnotationReference extends BaseAnnotation {
  name: string;
  similarity: number;
  text: string;
  fileId: string;
  type: "reference";
}

function isBaseAnnotation(value: JSONValue): value is BaseAnnotation {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string"
  );
}

const AnnotationBlock = ({
  annotations,
}: { annotations: JSONValue[] | undefined }) => {
  if (!annotations || annotations.length <= 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="font-bold">References</p>
      <div className="flex flex-wrap gap-2">
        {annotations.map((annotation, i) => {
          // FIXME: Bit awkward. Check if there's a better way to do this.

          let typedAnnotation = annotation;

          if (!isBaseAnnotation(typedAnnotation)) {
            try {
              typedAnnotation = JSON.parse(annotation as string);
            } catch (error) {
              console.error("Error parsing annotation:", error);
              return;
            }
          }

          if (!isBaseAnnotation(typedAnnotation)) {
            return; // Skip annotations that don't match the expected structure
          }

          switch (typedAnnotation.type) {
            case "reference": {
              const referenceAnnotation =
                typedAnnotation as AnnotationReference;
              return (
                // TODO: Add annotationId instead of this
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Popover key={i}>
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
