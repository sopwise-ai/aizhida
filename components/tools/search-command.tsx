"use client";

import { ArrowUpRight, Command } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { filterTools } from "@/lib/filter-tools";
import { getToolLogo } from "@/lib/tool-logos";
import { categoryLabel, type Tool } from "@/lib/tool-meta";

export function SearchCommand({ tools }: { tools: Tool[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    }
    function onOpen() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return tools.slice(0, 7);
    return filterTools(tools, {
      query,
      categories: [],
      pricing: "all",
      openSource: "all",
    }).slice(0, 8);
  }, [query, tools]);

  function openTool(tool: Tool) {
    window.open(tool.url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={`搜索 ${tools.length} 个工具，或输入用途…`}
        autoFocus
      />
      <CommandList>
        <CommandEmpty>
          没有找到匹配的工具，试试「视频」「免费」或「Agent」。
        </CommandEmpty>
        <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
          {query.trim() ? "搜索结果" : "快速进入"}
        </div>
        {results.map((tool) => {
          const logo = getToolLogo(tool.id);
          return (
            <CommandItem
              key={tool.id}
              value={`${tool.name} ${tool.desc} ${tool.tags.join(" ")}`}
              onSelect={() => openTool(tool)}
              className="gap-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                {logo ? (
                  // biome-ignore lint/performance/noImgElement: local, fixed-size brand marks
                  <img
                    src={logo}
                    alt=""
                    width={18}
                    height={18}
                    className="size-[18px] object-contain"
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {tool.name}
              </span>
              <span className="hidden max-w-[45%] truncate text-[11px] text-muted-foreground sm:block">
                {tool.desc}
              </span>
              <CommandShortcut className="ml-0 hidden sm:inline">
                {categoryLabel(tool.categories[0] ?? "productivity")}
              </CommandShortcut>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </CommandItem>
          );
        })}
        <div className="my-1 h-px bg-border" aria-hidden />
        <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
          操作
        </div>
        <CommandItem
          value="浏览全部工具"
          onSelect={() => {
            setOpen(false);
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
      </CommandList>
      <div className="hidden items-center justify-between border-t border-border px-3 py-2 text-[10px] text-muted-foreground sm:flex">
        <span className="flex items-center gap-2">
          <kbd className="rounded border border-border px-1 py-0.5">↑↓</kbd>
          选择
          <kbd className="rounded border border-border px-1 py-0.5">↵</kbd>
          打开
        </span>
        <span className="flex items-center gap-2">
          <kbd className="rounded border border-border px-1 py-0.5">esc</kbd>
          关闭
        </span>
      </div>
    </CommandDialog>
  );
}
