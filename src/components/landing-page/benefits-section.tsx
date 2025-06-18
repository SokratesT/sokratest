import {
  BotIcon,
  DatabaseIcon,
  GraduationCapIcon,
  LineChartIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BenefitsProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    Icon: GraduationCapIcon,
    title: "Your personal tutor",
    description:
      "Have a personal learning tutor always by your side to help you with your learning journey.",
  },
  {
    Icon: BotIcon,
    title: "AI-Powered",
    description:
      "Use the latest technology to get the most out of your learning experience.",
  },
  {
    Icon: DatabaseIcon,
    title: "Curated Content",
    description:
      "Teachers provide lessen material for each course, tailoring the tutor's responses to your study goals.",
  },
  {
    Icon: LineChartIcon,
    title: "Learning Analytics",
    description:
      "Students and teachers get detailed insights into their learning progress and performance.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid place-items-center lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="mb-2 font-bold text-lg text-primary tracking-wider">
            Sokrates<sup>t</sup>
          </h2>

          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            A new way to study
          </h2>
          <p className="mb-8 text-muted-foreground text-xl">
            Sokrates<sup>t</sup> leverages the latest technology to provide you
            with the a unique learning experience, custom tailored to your
            university courses.
          </p>
        </div>

        <div className="grid w-full gap-4 lg:grid-cols-2">
          {benefitList.map(({ Icon, title, description }, index) => (
            <Card
              key={title}
              className="group/number bg-muted/50 transition-all delay-75 hover:bg-background dark:bg-card"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon size={32} className="mb-6 text-primary" />
                  <span className="font-medium text-5xl text-muted-foreground/15 transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { BenefitsSection };
