import { LogoAnimated } from "@/components/app/logo-animated";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <AuroraBackground className="relative">
      <ThemeSwitcher className="absolute top-4 right-4 text-foreground" />
      <div className="z-10 flex h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Link href={ROUTES.PUBLIC.login.getPath()} className="cursor-default">
            <LogoAnimated variant="dynamic" />
          </Link>

          {children}

          <div>
            <p className="text-center text-muted-foreground text-sm">
              SokratesT is currently in closed beta and not publicly available.
            </p>
            <div className="mt-4 flex justify-center gap-4 text-foreground">
              <Link
                href="https://www.hochschule-rhein-waal.de/de/fakultaeten/kommunikation-und-umwelt/forschungsprojekte/sokratest"
                className={buttonVariants({ variant: "outline" })}
              >
                Learn more
              </Link>
              <Link
                href="https://ki-edu-nrw.ruhr-uni-bochum.de/ueber-das-projekt/phase-2/praxis-transferprojekte/aktuelle-praxisprojekte/#sokratest"
                className={buttonVariants({ variant: "outline" })}
              >
                KI:Edu.NRW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default AuthLayout;
