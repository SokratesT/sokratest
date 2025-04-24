import { FundingNotice } from "@/components/app/legal/funding-notice";
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

      <div className="flex flex-grow items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 px-2 py-8">
          <Link href={ROUTES.PUBLIC.login.getPath()} className="cursor-default">
            <LogoAnimated variant="dynamic" />
          </Link>

          {children}
        </div>
      </div>

      <div className="my-4 flex w-full justify-around p-2">
        <FundingNotice />
      </div>
    </main>
  );
};

export default AuthLayout;
