"use client";

import { sidebarUserMenu } from "@/settings/menus";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

const UserMenuActions = () => {
  const { setOpenMobile } = useSidebar();

  return (
    <DropdownMenuGroup>
      {sidebarUserMenu.map((item) => (
        <DropdownMenuItem key={item.url} asChild>
          <Link href={item.url} onClick={() => setOpenMobile(false)}>
            <item.icon />
            {item.title}
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
};

export { UserMenuActions };
