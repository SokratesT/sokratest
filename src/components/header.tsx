"use client";

import { PageTitle } from "@/components/page-title";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { routes } from "@/settings/routes";
import { ArrowLeftToLine } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const { isMobile, state } = useSidebar();

  return (
    <header
      className={cn(
        "fixed z-50 flex h-14 items-center justify-between gap-2 border-b bg-background p-4 transition-all",
        {
          "w-full": isMobile,
          "w-[calc(100%-var(--sidebar-width))]":
            !isMobile && state === "expanded",
          "w-[calc(100%-var(--sidebar-width-icon))]":
            !isMobile && state === "collapsed",
        },
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <PageTitle />
      </div>
      <div className="flex gap-2">
        <Button size="icon" className="size-8" variant="outline" asChild>
          <Link href={routes.root.path}>
            <ArrowLeftToLine />
          </Link>
        </Button>
        <ThemeSwitcher className="h-8 w-8 px-0" />
      </div>
    </header>
  );
};

export { Header };
