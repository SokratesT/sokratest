import { FundingNotice } from "@/components/app/funding-notice";
import { LogoAnimated } from "@/components/app/logo-animated";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import { ROUTES } from "@/settings/routes";
import Link from "next/link";

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="flex min-h-screen flex-col">
      <AuroraBackground className="-z-10 fixed inset-0 h-full w-full" />

      <ThemeSwitcher className="fixed top-4 right-4 z-20 text-foreground" />

      {/* Main content area that takes up available space */}
      <div className="flex flex-grow items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Link href={ROUTES.PUBLIC.login.getPath()} className="cursor-default">
            <LogoAnimated variant="dynamic" />
          </Link>

          {children}
        </div>
      </div>

      {/* Funding notice at the bottom */}
      <div className="my-4 flex w-full justify-around">
        <FundingNotice />
      </div>
    </main>
  );
};

export default AuthLayout;
