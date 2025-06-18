"use client";

import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { useSidebar } from "@/components/ui/sidebar";
import { ROUTES } from "@/settings/routes";

const SidebarLogo = () => {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Link
      href={ROUTES.PRIVATE.root.getPath()}
      className="flex items-center lg:justify-center"
      onClick={() => isMobile && setOpenMobile(false)}
    >
      <Logo />
    </Link>
  );
};

export { SidebarLogo };
