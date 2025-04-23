import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

const AboutModal = ({ children }: { children: ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-10/12 max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            What is Sokrates<sup>t</sup>?
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[800px] w-full">
          <div className="flex flex-col gap-4">
            <p>
              You are using a prototypical Turoring System based on generative
              AI, trained specifically on the content and the methodologies of
              your course module.
            </p>
            <p>
              The system applies so-called Retrieval Augemented Generation (RAG
              in short) and has been additionally tailored to support individual
              learning journeys in didactically valuable ways by applying the
              so-called Socratic forms of dialogue that adapt automatically to
              the learner's present levels of understanding and their individual
              learning needs.
            </p>
            <p>
              The testing of this prototypical system is part of a research
              project funded by the state of NRW (KI:edu.nrw), co-ordinated by
              Profs. Gerber and Pfeiffer (HSRW). The Tutoring System itself has
              been developed technically by Lars Lorenz (also HSRW).
            </p>

            <div className="mt-4 flex justify-center gap-4">
              <Link
                href="https://www.hochschule-rhein-waal.de/de/fakultaeten/kommunikation-und-umwelt/forschungsprojekte/sokratest"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
                target="_blank"
              >
                About Sokratesᵗ
              </Link>
              <Link
                href="https://ki-edu-nrw.ruhr-uni-bochum.de/ueber-das-projekt/phase-2/praxis-transferprojekte/aktuelle-praxisprojekte/#sokratest"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                target="_blank"
              >
                About KI:edu.nrw
              </Link>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { AboutModal };
