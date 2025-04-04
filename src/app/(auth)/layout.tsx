import { LogoAnimated } from "@/components/app/logo-animated";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative">
      <ThemeSwitcher className="absolute top-4 right-4" />
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <LogoAnimated variant="dynamic" />

          {children}

          <div>
            <p className="text-center text-muted-foreground text-sm">
              SokratesT is currently in closed beta and not publicly available.
            </p>
            <div className="mt-4 flex justify-center gap-4">
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
    </div>
  );
};

export default AuthLayout;
