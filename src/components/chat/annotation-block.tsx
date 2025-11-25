"use client";

import type { JSONValue } from "ai";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentMetadataType } from "@/db/schema/document";
import { useUmami } from "@/hooks/use-umami";
import { cn } from "@/lib/utils";

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

function parseAnnotation(annotation: JSONValue): BaseAnnotation | null {
  if (isBaseAnnotation(annotation)) {
    return annotation;
  }

  if (typeof annotation === "string") {
    try {
      const parsed = JSON.parse(annotation) as JSONValue;
      if (isBaseAnnotation(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error("Error parsing annotation:", error);
      return null;
    }
  }

  return null;
}

const AnnotationBlock = ({
  annotations,
  className,
  ...props
}: { annotations: JSONValue[] | undefined } & ComponentProps<"div">) => {
  const { trackEvent } = useUmami();

  if (!annotations || annotations.length <= 0) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)} {...props}>
      <Accordion
        type="single"
        collapsible
        defaultValue={annotations.length <= 6 ? "item-1" : undefined}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="py-2 font-bold text-md">
            References {annotations.length > 0 && `(${annotations.length})`}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            {annotations.map((annotation, i) => {
              const typedAnnotation = parseAnnotation(annotation);
              if (!typedAnnotation) {
                return null;
              }

              switch (typedAnnotation.type) {
                case "reference": {
                  const referenceAnnotation =
                    typedAnnotation as AnnotationReference;
                  return (
                    <Popover key={`${typedAnnotation.id}-${i}`}>
                      <PopoverTrigger className="inline-flex w-fit gap-2 rounded-md border bg-card p-1.5 text-left font-medium text-sm shadow-xs outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:border-input dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                        <Badge
                          variant="secondary"
                          className="mr-1 inline-flex size-5 items-center justify-center overflow-clip rounded-full font-bold text-xs"
                        >
                          {i + 1}
                        </Badge>
                        <span className="wrap-anywhere line-clamp-1">
                          {referenceAnnotation.title}
                        </span>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-full max-w-[400px] p-4"
                        align="start"
                      >
                        <ScrollArea className="size-full pr-2">
                          <div className="space-y-3">
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Title
                              </p>
                              <p className="font-medium text-sm">
                                {referenceAnnotation.title}
                              </p>
                            </div>

                            {referenceAnnotation.metadata.chapterTitle && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Chapter
                                </p>
                                <p className="text-sm">
                                  {referenceAnnotation.metadata.chapterTitle}
                                  {referenceAnnotation.metadata.pageRange &&
                                    ` (pp. ${referenceAnnotation.metadata.pageRange})`}
                                </p>
                              </div>
                            )}

                            {referenceAnnotation.metadata.author && (
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Author(s)
                                </p>
                                <p className="text-sm">
                                  {referenceAnnotation.metadata.author}
                                </p>
                              </div>
                            )}

                            {referenceAnnotation.metadata.citation && (
                              <div>
                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                  <p>Citation</p>
                                  <CopyButton
                                    variant="link"
                                    className="size-4 p-0"
                                    value={
                                      referenceAnnotation.metadata.citation
                                    }
                                    tooltipText="Copy citation"
                                  />
                                </div>

                                <p className="text-sm">
                                  {referenceAnnotation.metadata.citation}
                                </p>
                              </div>
                            )}

                            {referenceAnnotation.metadata.externalUrl && (
                              <div className="pt-2">
                                <Link
                                  href={
                                    referenceAnnotation.metadata.externalUrl
                                  }
                                  className="inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
                                  target="_blank"
                                  onClick={() =>
                                    trackEvent("annotation-source-click", {
                                      target:
                                        referenceAnnotation.metadata
                                          .externalUrl,
                                      reference: referenceAnnotation.id,
                                    })
                                  }
                                >
                                  Source
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export { AnnotationBlock };
