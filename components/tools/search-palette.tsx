"use client";

import { ArrowUpRight, Command } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { DEFAULT_FILTERS, filterTools } from "@/lib/filter-tools";
import { categoryLabel } from "@/lib/tool-meta";
import type { ToolSummary } from "@/lib/tool-summary";
import { ToolLogo } from "./tool-logo";

/**
 * ⌘K 面板本体。cmdk + dialog 只在第一次打开时才会被下载，
 * 因此和首页首屏的依赖分开打包（见 search-command.tsx 的动态 import）。
 */
export function SearchPalette({
  tools,
  open,
  initialQuery = "",
  onOpenChange,
}: {
  tools: ToolSummary[];
  open: boolean;
  /** 打开时预填的关键词（来自首屏搜索框）。 */
  initialQuery?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  const results = useMemo(() => {
    if (!query.trim()) return tools.slice(0, 7);
    return filterTools(tools, { ...DEFAULT_FILTERS, query }).slice(0, 8);
  }, [query, tools]);

  function close() {
    onOpenChange(false);
    setQuery("");
  }

  return (
    <CommandDialog
      open={open}
      shouldFilter={false}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        close();
      }}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={`搜索 ${tools.length} 个工具，或输入用途…`}
        autoFocus
      />
      <CommandList>
        <CommandGroup heading={query.trim() ? "搜索结果" : "快速进入"}>
          {results.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-[12px]">
              没有找到匹配的工具，试试「视频」「免费」或「Agent」。
            </p>
          ) : null}
          {results.map((tool) => {
            return (
              <CommandItem
                key={tool.id}
                value={`${tool.name} ${tool.tagline} ${tool.features.join(" ")} ${tool.keywords.join(" ")}`}
                onSelect={() => {
                  window.open(tool.website, "_blank", "noopener,noreferrer");
                  close();
                }}
                className="gap-3"
              >
                <span className="border-border bg-background flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                  <ToolLogo tool={tool} iconSize={18} />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {tool.name}
                </span>
                <span className="text-muted-foreground hidden max-w-[45%] truncate text-[11px] sm:block">
                  {tool.tagline}
                </span>
                <CommandShortcut className="ml-0 hidden sm:inline">
                  {categoryLabel(tool.categories[0] ?? "assistant")}
                </CommandShortcut>
                <ArrowUpRight className="text-muted-foreground size-3.5" />
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="操作">
          <CommandItem
            value="浏览全部工具"
            onSelect={() => {
              close();
              document.getElementById("all-tools")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <Command className="size-3.5" />
            浏览全部工具
            <CommandShortcut>↵</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="提交工具"
            onSelect={() => {
              window.location.href = "/submit";
            }}
          >
            <ArrowUpRight className="size-3.5" />
            提交一个工具
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="border-border text-muted-foreground hidden items-center justify-between border-t px-3 py-2 text-[10px] sm:flex">
        <span className="flex items-center gap-2">
          <kbd className="border-border rounded border px-1 py-0.5">↑↓</kbd>
          选择
          <kbd className="border-border rounded border px-1 py-0.5">↵</kbd>
          打开
        </span>
        <span className="flex items-center gap-2">
          <kbd className="border-border rounded border px-1 py-0.5">esc</kbd>
          关闭
        </span>
      </div>
    </CommandDialog>
  );
}
