"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentMetadataType } from "@/db/schema/document";
import { cn } from "@/lib/utils";
import type { JSONValue } from "ai";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

interface BaseAnnotation extends Record<string, JSONValue> {
  type: string;
}

interface AnnotationReference extends BaseAnnotation {
  id: string;
  title: string;
  metadata: DocumentMetadataType & JSONValue;
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
  className,
  ...props
}: { annotations: JSONValue[] | undefined } & ComponentProps<"div">) => {
  if (!annotations || annotations.length <= 0) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)} {...props}>
      <p className="font-bold">References</p>
      <div className="flex flex-col gap-2">
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
                // biome-ignore lint/suspicious/noArrayIndexKey:
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <Button
                      className="group w-fit truncate px-2 text-left text-sm"
                      variant="outline"
                    >
                      <Badge
                        variant="secondary"
                        className="mr-1 inline-flex size-5 items-center justify-center overflow-clip rounded-full font-bold text-xs"
                      >
                        {i + 1}
                      </Badge>
                      <span className="truncate">
                        {referenceAnnotation.title}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full max-w-[400px] p-4"
                    align="start"
                  >
                    <ScrollArea className="size-full pr-2">
                      <div className="space-y-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Title</p>
                          <p className="font-medium text-sm">
                            {referenceAnnotation.title}
                          </p>
                        </div>

                        {referenceAnnotation.metadata.citation && (
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Citation
                            </p>
                            <p className="text-sm">
                              {referenceAnnotation.metadata.citation}
                            </p>
                          </div>
                        )}

                        {referenceAnnotation.metadata.externalUrl && (
                          <div className="pt-2">
                            <Link
                              href={referenceAnnotation.metadata.externalUrl}
                              className="inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
                              target="_blank"
                            >
                              View File
                              <ArrowUpRightIcon size={16} />
                            </Link>
                          </div>
                        )}
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
