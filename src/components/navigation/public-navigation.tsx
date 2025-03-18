"use client";

import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/settings/menus";
import { ROUTES } from "@/settings/routes";
import { Menu, MoveRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { NavigationAuthButtons } from "./navigation-auth-buttons";

const PublicNavigation = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-border/40 border-b bg-background/80 backdrop-blur-md">
      <div className="container relative mx-auto flex h-20 flex-row items-center gap-4 lg:grid lg:grid-cols-3">
        <div className="hidden flex-row items-center justify-start gap-4 lg:flex">
          <NavigationMenu className="flex items-start justify-start">
            <NavigationMenuList className="flex flex-row justify-start gap-2">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title} className="group">
                  {item.href ? (
                    <Link href={item.href} passHref legacyBehavior>
                      <NavigationMenuLink asChild>
                        <Button
                          variant="ghost"
                          className="relative overflow-hidden rounded-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {item.title}
                          <motion.span
                            className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </Button>
                      </NavigationMenuLink>
                    </Link>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="rounded-md font-medium text-sm hover:bg-accent">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="w-[450px]! border border-border/40 bg-background/90 p-4 shadow-lg backdrop-blur-md">
                        <div className="flex grid-cols-2 flex-col gap-4 lg:grid">
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex flex-col">
                              <p className="font-semibold text-base">
                                {item.title}
                              </p>
                              <p className="mt-1 text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="group relative mt-10 overflow-hidden"
                            >
                              <span className="relative z-10">Sign up now</span>
                              <motion.span
                                className="absolute inset-0 bg-primary/10"
                                initial={{ scale: 0, x: "100%" }}
                                whileHover={{ scale: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            </Button>
                          </div>
                          <div className="flex h-full flex-col justify-end space-y-1 text-sm">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                href={subItem.href}
                                key={subItem.title}
                                className="group flex flex-row items-center justify-between rounded-md px-3 py-2 hover:bg-accent"
                              >
                                <span>{subItem.title}</span>
                                <motion.div
                                  initial={{ x: 0 }}
                                  whileHover={{ x: 4 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <MoveRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                                </motion.div>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Link
          href={ROUTES.PUBLIC.root.getPath()}
          className="flex items-center lg:justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-bold text-transparent text-xl"
          >
            SokratesT
          </motion.div>
        </Link>
        <div className="flex w-full items-center justify-end gap-4">
          <Button variant="ghost" className="hidden hover:bg-accent md:inline">
            Learn more
          </Button>
          <ThemeSwitcher className="size-9" />
          <div className="hidden h-6 border-border/60 border-r md:inline" />

          <NavigationAuthButtons />
        </div>
        <div className="flex w-12 shrink items-end justify-end lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!isOpen)}
            className="rounded-full hover:bg-accent"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className={cn(
                  "fixed inset-x-0 top-20 z-50 flex w-full flex-col gap-6",
                  "border-t bg-background/95 px-4 py-6 shadow-lg backdrop-blur-md",
                )}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="container mx-auto flex flex-col space-y-6">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col gap-3">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="group flex items-center justify-between"
                            onClick={() => setOpen(false)}
                          >
                            <span className="font-medium text-lg">
                              {item.title}
                            </span>
                            <motion.div
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <MoveRight className="size-4 stroke-1 text-muted-foreground group-hover:text-foreground" />
                            </motion.div>
                          </Link>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium text-lg">{item.title}</p>
                            <p className="text-muted-foreground text-sm">
                              {item.description}
                            </p>
                          </div>
                        )}
                        {item.items?.map((subItem, subIndex) => (
                          <motion.div
                            key={subItem.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + subIndex * 0.05 }}
                          >
                            <Link
                              href={subItem.href}
                              className="group flex items-center justify-between border-border/40 border-l py-2 pl-4"
                              onClick={() => setOpen(false)}
                            >
                              <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                                {subItem.title}
                              </span>
                              <motion.div
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <MoveRight className="size-4 stroke-1 transition-colors group-hover:text-primary" />
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    className="mt-4 flex justify-center border-border/40 border-t pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setOpen(false)}
                    >
                      Sign up now
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export { PublicNavigation };
