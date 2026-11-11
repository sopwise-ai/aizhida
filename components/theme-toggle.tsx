"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative size-10 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
          aria-pressed={isDark}
        >
          <Sun className="size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Moon className="absolute size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "切换到浅色模式" : "切换到深色模式"}
      </TooltipContent>
    </Tooltip>
  );
}
