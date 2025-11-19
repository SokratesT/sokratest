import { Markdown } from "@/components/chat/markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ReasoningPart = ({ reasoning }: { reasoning: string }) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="mb-4 rounded-2xl border bg-card px-4"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="py-2">Show Reasoning</AccordionTrigger>
        <AccordionContent>
          <Markdown className="text-sm">{reasoning}</Markdown>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
