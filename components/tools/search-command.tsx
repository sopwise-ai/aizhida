"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import type { ToolSummary } from "@/lib/tool-summary";

// 只有快捷键/搜索框真正打开时才需要 cmdk 与 dialog：首屏不下载这块 chunk。
const SearchPalette = dynamic(
  () => import("./search-palette").then((mod) => mod.SearchPalette),
  { ssr: false },
);

export function SearchCommand({ tools }: { tools: ToolSummary[] }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [seed, setSeed] = useState("");

  // 首屏搜索框已经输入了关键词时，打开面板要接着这段话搜，而不是清空重来。
  const currentQuery = useCallback(
    () =>
      (document.getElementById("tool-search") as HTMLInputElement | null)
        ?.value ?? "",
    [],
  );

  const openPalette = useCallback(() => {
    setSeed(currentQuery());
    setLoaded(true);
    setOpen(true);
  }, [currentQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }
      event.preventDefault();
      setSeed(currentQuery());
      setLoaded(true);
      setOpen((previous) => !previous);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", openPalette);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", openPalette);
    };
  }, [openPalette, currentQuery]);

  if (!loaded) return null;

  return (
    <SearchPalette
      tools={tools}
      initialQuery={seed}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) return;
        // 快捷键打开时没有触发元素，Radix 会把焦点还给 body；显式回到搜索框。
        requestAnimationFrame(() => {
          document.getElementById("tool-search")?.focus();
        });
      }}
    />
  );
}
