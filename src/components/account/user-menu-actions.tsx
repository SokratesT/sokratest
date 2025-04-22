"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { sidebarUserMenu } from "@/settings/menus";
import Link from "next/link";

const UserMenuActions = () => {
  const { setOpenMobile } = useSidebar();

  return (
    <DropdownMenuGroup>
      {sidebarUserMenu.map((item) => (
        <DropdownMenuItem key={item.url} asChild>
          <Link href={item.url} onClick={() => setOpenMobile(false)}>
            <item.icon className="hover:text-foreground" />
            {item.title}
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
};

export { UserMenuActions };
