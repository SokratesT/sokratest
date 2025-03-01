"use client";

import { Button } from "@/components/ui/button";
import { META_THEME_COLORS, useMetaColor } from "@/hooks/use-meta-color";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";

const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();
  const [isDark, setIsDark] = useState(resolvedTheme === "dark");

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setMetaColor(
      newTheme === "dark" ? META_THEME_COLORS.dark : META_THEME_COLORS.light,
    );
    setIsDark(newTheme === "dark");
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <Button
      variant="ghost"
      className={cn("group/toggle overflow-hidden", className)}
      onClick={toggleTheme}
    >
      <AnimatePresence initial={false} mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SunIcon className="block" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MoonIcon className="block" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export { ThemeSwitcher };
