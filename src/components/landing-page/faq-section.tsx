import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is SokratesT?",
    answer:
      "SokratesT is an AI-powered tutor to help students study. Teachers upload upload course material, and the SokratesT Chatbot uses this information to improve its responses and help students learn.",
    value: "item-1",
  },
  {
    question: "Can I use SokratesT now?",
    answer:
      "Currently the project is in development and not yet available for public use. However, you can follow the project on GitHub and social media to stay up to date with the latest developments.",
    value: "item-2",
  },
  {
    question: "How is this funded?",
    answer:
      "The project is funded by KI:Edu.NRW, a program of the Ministry of Culture and Science of the State of North Rhine-Westphalia, Germany.",
    value: "item-3",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32 md:w-[700px]">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-center text-lg text-primary tracking-wider">
          FAQs
        </h2>

        <h2 className="text-center font-bold text-3xl md:text-4xl">
          Common Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
