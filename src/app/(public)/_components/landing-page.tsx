import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/settings/routes";
import { MoveRight, PhoneCall } from "lucide-react";
import Link from "next/link";

const LandingPage = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="outline">We&apos;re live!</Badge>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-regular max-w-lg text-left text-5xl tracking-tighter md:text-7xl">
              Enhance your learning with AI!
            </h1>
            <p className="max-w-md text-left text-xl leading-relaxed tracking-tight text-muted-foreground">
              SokratesT helps you learn better with AI. We provide you with the
              best learning experience. Sign up now and start learning!
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button size="lg" className="gap-4" asChild>
              <Link href={routes.login.path}>
                Sign up here <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="aspect-square rounded-md bg-muted"></div>
          <div className="row-span-2 rounded-md bg-muted"></div>
          <div className="aspect-square rounded-md bg-muted"></div>
        </div>
      </div>
    </div>
  </div>
);

export { LandingPage };
