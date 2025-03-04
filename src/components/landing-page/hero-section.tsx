"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/settings/routes";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  const { theme } = useTheme();
  return (
    <section className="container w-full">
      <div className="mx-auto grid place-items-center gap-8 lg:max-w-screen-xl">
        <div className="space-y-8 text-center">
          <Badge variant="outline" className="py-2 text-sm">
            <span className="mr-2 text-primary">
              <Badge>New</Badge>
            </span>
            <span> SokratesT is out now! </span>
          </Badge>

          <div className="mx-auto max-w-screen-md text-center font-bold text-4xl md:text-6xl">
            <h1>
              Experience <br />
              <span className="bg-gradient-to-r from-[#926727] to-primary bg-clip-text px-2 text-transparent">
                AI-powered learning
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-screen-sm text-muted-foreground text-xl">
            Experience a new way of learning with SokratesT, the AI-powered
            learning platform that helps you get more out of your learning
            journey.
          </p>

          <div className="space-y-4 md:space-x-4 md:space-y-0">
            <Button asChild className="group/arrow w-5/6 font-bold md:w-1/4">
              <Link href={routes.app.path} target="_blank">
                Get Started
                <ArrowRight className="ml-2 size-5 transition-transform group-hover/arrow:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="group relative mt-14">
          <div className="lg:-top-8 -translate-x-1/2 absolute top-2 left-1/2 mx-auto h-24 w-[90%] transform rounded-full bg-accent/70 blur-3xl lg:h-80" />
          <Image
            width={1200}
            height={1000}
            className="rouded-lg relative mx-auto flex w-full items-center rounded-lg border-secondary border-t-2 border-t-primary/30 leading-none md:w-[1200px]"
            src={
              theme === "light"
                ? "/landing-page/hero-light.png"
                : "/landing-page/hero-dark.png"
            }
            alt="dashboard"
          />

          <div className="absolute bottom-0 left-0 h-20 w-full rounded-lg bg-gradient-to-b from-background/0 via-background/50 to-background md:h-28" />
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
