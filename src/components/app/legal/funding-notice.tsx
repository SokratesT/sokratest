import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface FundingNoticeProps {
  className?: string;
}

const FundingNotice = ({ className }: FundingNoticeProps) => {
  return (
    <Card
      className={cn(
        "bg-white py-6 text-foreground dark:text-background",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div>
          <p className="text-center text-muted-foreground text-sm dark:text-background/60">
            SokratesT is an Applied Project of KI:edu.nrw and currently in
            closed access at Rhine-Waal University.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              href="https://www.hochschule-rhein-waal.de/de/fakultaeten/kommunikation-und-umwelt/forschungsprojekte/sokratest"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                }),
              )}
            >
              About SokratesT
            </Link>
            <Link
              href="https://ki-edu-nrw.ruhr-uni-bochum.de/ueber-das-projekt/phase-2/praxis-transferprojekte/aktuelle-praxisprojekte/#sokratest"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              About KI:edu.nrw
            </Link>
          </div>
        </div>
        <Separator className="bg-muted-foreground/50" />
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-6 text-center text-muted-foreground text-sm sm:flex-row sm:gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-10 sm:flex-row sm:gap-12 md:gap-16">
              <Image
                src="/funding/KIedu.nrw_Praxisprojekt.png"
                alt="KI.EDU.NRW Logo"
                width={220}
                height={100}
                style={{ objectFit: "contain", height: "auto" }}
                priority
                className="w-full max-w-[270px]"
              />
              <Image
                src="/funding/DHnrw.png"
                alt="DH.nrw Logo"
                width={200}
                height={100}
                style={{ objectFit: "contain", height: "auto" }}
                priority
                className="w-full max-w-[250px]"
              />
              <Image
                src="/funding/MKW NRW.png"
                alt="MKW NRW Logo"
                width={240}
                height={100}
                style={{ objectFit: "contain", height: "auto" }}
                priority
                className="w-full max-w-[290px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { FundingNotice };
