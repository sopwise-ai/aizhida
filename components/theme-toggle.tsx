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
          className="text-muted-foreground hover:text-foreground relative size-10"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
          aria-pressed={isDark}
        >
          <Sun className="size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <Moon className="absolute size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "切换到浅色模式" : "切换到深色模式"}
      </TooltipContent>
    </Tooltip>
  );
}
