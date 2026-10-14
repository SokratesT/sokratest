"use client";

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
import { useUmami } from "@/hooks/use-umami";
import type { ChatReference } from "@/lib/ai/chat-message";
import { cn } from "@/lib/utils";

const AnnotationBlock = ({
  references,
  className,
  ...props
}: { references: ChatReference[] } & ComponentProps<"div">) => {
  const { trackEvent } = useUmami();

  if (references.length <= 0) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)} {...props}>
      <Accordion
        type="single"
        collapsible
        defaultValue={references.length <= 6 ? "item-1" : undefined}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="py-2 font-bold text-md">
            References {references.length > 0 && `(${references.length})`}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            {references.map((reference, i) => (
              <Popover key={reference.id}>
                <PopoverTrigger className="inline-flex w-fit gap-2 rounded-md border bg-card p-1.5 text-left font-medium text-sm shadow-xs outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:border-input dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                  <Badge
                    variant="secondary"
                    className="mr-1 inline-flex size-5 items-center justify-center overflow-clip rounded-full font-bold text-xs"
                  >
                    {i + 1}
                  </Badge>
                  <span className="wrap-anywhere line-clamp-1">
                    {reference.title}
                  </span>
                </PopoverTrigger>

                <PopoverContent
                  className="w-full max-w-[400px] p-4"
                  align="start"
                >
                  <ScrollArea className="size-full pr-2">
                    <div className="space-y-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Title</p>
                        <p className="font-medium text-sm">{reference.title}</p>
                      </div>

                      {reference.metadata.chapterTitle && (
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Chapter
                          </p>
                          <p className="text-sm">
                            {reference.metadata.chapterTitle}
                            {reference.metadata.pageRange &&
                              ` (pp. ${reference.metadata.pageRange})`}
                          </p>
                        </div>
                      )}

                      {reference.metadata.author && (
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Author(s)
                          </p>
                          <p className="text-sm">{reference.metadata.author}</p>
                        </div>
                      )}

                      {reference.metadata.citation && (
                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <p>Citation</p>
                            <CopyButton
                              variant="link"
                              className="size-4 p-0"
                              value={reference.metadata.citation}
                              tooltipText="Copy citation"
                            />
                          </div>

                          <p className="text-sm">
                            {reference.metadata.citation}
                          </p>
                        </div>
                      )}

                      {reference.metadata.externalUrl && (
                        <div className="pt-2">
                          <Link
                            href={reference.metadata.externalUrl}
                            className="inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
                            target="_blank"
                            onClick={() =>
                              trackEvent("annotation-source-click", {
                                target: reference.metadata.externalUrl,
                                reference: reference.id,
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
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export { AnnotationBlock };
