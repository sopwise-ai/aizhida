"use client";

import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Search,
  SearchX,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  filterTools,
  isCategory,
  isPricing,
  type ToolFilters,
} from "@/lib/filter-tools";
import { DATA_UPDATED_LABEL } from "@/lib/site";
import { getToolLogo } from "@/lib/tool-logos";
import {
  CATEGORIES,
  type Category,
  categoryLabel,
  type OpenSourceFilter,
  type Pricing,
  pricingLabel,
  type Tool,
} from "@/lib/tool-meta";
import { cn } from "@/lib/utils";
import { FilterSheet } from "./filter-sheet";
import { SearchCommand } from "./search-command";
import { ToolCard } from "./tool-card";

const EMPTY_FILTERS: ToolFilters = {
  query: "",
  categories: [],
  pricing: "all",
  openSource: "all",
};

const SEARCH_SUGGESTIONS = [
  { label: "对话", query: "对话" },
  { label: "视频", category: "video" },
  { label: "免费", pricing: "free" },
  { label: "开源", openSource: "yes" },
] as const;

function readFiltersFromUrl(): ToolFilters {
  if (typeof window === "undefined") return EMPTY_FILTERS;

  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("cat") ?? "";
  const categories = categoryParam.split(",").filter(isCategory);
  const price = params.get("price");
  const source = params.get("source");

  return {
    query: params.get("q") ?? "",
    categories,
    pricing: isPricing(price) ? price : "all",
    openSource:
      source === "yes" || source === "no"
        ? (source as OpenSourceFilter)
        : "all",
  };
}

function writeFiltersToUrl(filters: ToolFilters, replace: boolean) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.categories.length)
    params.set("cat", filters.categories.join(","));
  if (filters.pricing !== "all") params.set("price", filters.pricing);
  if (filters.openSource !== "all") params.set("source", filters.openSource);

  const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next === current) return;
  if (replace) window.history.replaceState(null, "", next);
  else window.history.pushState(null, "", next);
}

function tabClass(active: boolean) {
  return cn(
    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
    active
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  );
}

function filterChipClass() {
  return "inline-flex min-h-8 items-center gap-1 rounded-md bg-accent px-2 py-1 text-[11px] leading-4 text-accent-foreground transition-colors hover:bg-muted";
}

function FeaturedPanel({ tools }: { tools: Tool[] }) {
  const primary =
    tools.find((tool) => tool.id === "chatgpt") ??
    tools.find((tool) => tool.id === "cursor") ??
    tools[0];

  if (!primary) return null;

  const rows = ["midjourney", "cursor", "deepseek"]
    .map((id) => tools.find((tool) => tool.id === id))
    .filter(
      (tool): tool is Tool => tool !== undefined && tool.id !== primary.id,
    );

  const primaryLogo = getToolLogo(primary.id);

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-border bg-background p-2 shadow-[0_0_0_1px_rgba(25,23,33,0.03),0_1px_2px_rgba(25,23,33,0.04)] lg:ml-auto">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
            本期精选
          </span>
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
            04
          </span>
        </div>

        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block p-4 transition-colors hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-inset focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-brand"
          />
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-white">
              {primaryLogo ? (
                // biome-ignore lint/performance/noImgElement: local brand mark
                <img
                  src={primaryLogo}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 object-contain"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {primary.name.slice(0, 1)}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] tracking-[0.12em] text-brand">
                编辑推荐
              </p>
              <h2 className="mt-0.5 truncate text-[18px] font-semibold tracking-[-0.025em]">
                {primary.name}
              </h2>
            </div>
            <ArrowUpRight
              aria-hidden
              className="mt-1 size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
            {primary.desc}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {categoryLabel(primary.categories[0] ?? "productivity")}
              <span className="text-border" aria-hidden>
                /
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 rounded-md px-1.5 text-[10px]",
                  primary.pricing === "free" && "bg-brand-soft text-brand",
                )}
              >
                {pricingLabel(primary.pricing)}
              </Badge>
            </span>
            <span className="text-[11px] text-muted-foreground">
              打开官网 ↗
            </span>
          </div>
        </a>

        <div className="border-t border-border">
          {rows.map((tool) => {
            const logo = getToolLogo(tool.id);
            return (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-inset focus-visible:outline-none"
              >
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-[5px]">
                  {logo ? (
                    // biome-ignore lint/performance/noImgElement: local brand mark
                    <img
                      src={logo}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold">
                      {tool.name.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {tool.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {categoryLabel(tool.categories[0] ?? "productivity")}
                </span>
                <ArrowUpRight
                  className="size-3 text-muted-foreground"
                  aria-hidden
                />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ToolsExplorer({ tools }: { tools: Tool[] }) {
  const [filters, setFilters] = useState<ToolFilters>(EMPTY_FILTERS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const historyReady = useRef(false);
  const lastQuery = useRef(filters.query);
  const searchRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => filterTools(tools, filters), [tools, filters]);

  const categoryFacet = useMemo(
    () => filterTools(tools, { ...filters, categories: [] }),
    [tools, filters],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<Category, number>();
    for (const tool of categoryFacet) {
      for (const category of tool.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return counts;
  }, [categoryFacet]);

  const pricingFacet = useMemo(
    () => filterTools(tools, { ...filters, pricing: "all" }),
    [tools, filters],
  );

  const sourceFacet = useMemo(
    () => filterTools(tools, { ...filters, openSource: "all" }),
    [tools, filters],
  );

  const pricingCounts = useMemo(() => {
    const counts = new Map<Pricing, number>();
    for (const tool of pricingFacet) {
      counts.set(tool.pricing, (counts.get(tool.pricing) ?? 0) + 1);
    }
    return counts;
  }, [pricingFacet]);

  const openSourceCount = useMemo(
    () => sourceFacet.filter((tool) => tool.openSource).length,
    [sourceFacet],
  );

  useEffect(() => {
    setFilters(readFiltersFromUrl());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!historyReady.current) {
      historyReady.current = true;
      writeFiltersToUrl(filters, true);
      lastQuery.current = filters.query;
      return;
    }
    writeFiltersToUrl(filters, lastQuery.current === filters.query);
    lastQuery.current = filters.query;
  }, [filters, hydrated]);

  useEffect(() => {
    function onPopState() {
      setFilters(readFiltersFromUrl());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.key !== "Escape") return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          '[role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]',
        )
      ) {
        return;
      }

      if (document.activeElement !== searchRef.current) return;
      if (filters.query) {
        setFilters((previous) => ({ ...previous, query: "" }));
      } else {
        searchRef.current?.blur();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filters.query]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const hasFilters =
    filters.query.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.pricing !== "all" ||
    filters.openSource !== "all";

  const activeCategory = filters.categories[0];

  function updateFilters(updater: (previous: ToolFilters) => ToolFilters) {
    setFilters(updater);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    searchRef.current?.focus();
  }

  function selectCategory(value: string) {
    updateFilters((previous) => ({
      ...previous,
      categories: !value || value === "all" ? [] : [value as Category],
    }));
  }

  function handleCategoryKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const values = ["all", ...CATEGORIES.map((item) => item.value)] as const;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % values.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + values.length) % values.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = values.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="toggle-group-item"]',
      );
    buttons?.[next]?.focus();
    selectCategory(values[next]);
  }

  function applySuggestion(suggestion: (typeof SEARCH_SUGGESTIONS)[number]) {
    if ("query" in suggestion) {
      updateFilters((previous) => ({ ...previous, query: suggestion.query }));
    } else if ("category" in suggestion) {
      updateFilters((previous) => ({
        ...previous,
        categories: [suggestion.category],
      }));
    } else if ("pricing" in suggestion) {
      updateFilters((previous) => ({
        ...previous,
        pricing: suggestion.pricing,
      }));
    } else {
      updateFilters((previous) => ({
        ...previous,
        openSource: suggestion.openSource,
      }));
    }
  }

  async function copyCurrentView() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("筛选链接已复制");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
      toast.error("复制失败，请从地址栏复制");
    }
  }

  function removeCategory(category: Category) {
    updateFilters((previous) => ({
      ...previous,
      categories: previous.categories.filter((item) => item !== category),
    }));
  }

  const resultLabel = filters.query.trim()
    ? "搜索结果"
    : hasFilters
      ? "筛选结果"
      : "全部工具";

  return (
    <div>
      <SearchCommand tools={tools} />
      <section className="hero-surface relative overflow-hidden border-b border-border">
        <div className="relative mx-auto max-w-7xl px-4 pt-[calc(3.5rem+1.75rem)] pb-10 sm:px-6 sm:pt-[calc(5rem+3rem)] lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                人工编排 · 无需登录
              </span>
              <h1 className="display-title mt-5 text-[clamp(1.9rem,9.5vw,3.75rem)] leading-[1.06] font-bold tracking-[-0.02em] text-foreground">
                只收王牌，一键直达
              </h1>
              <p className="mt-4 max-w-[34rem] text-[14px] leading-6 text-pretty text-muted-foreground sm:text-[15px] sm:leading-7">
                精选真正值得用的 AI
                工具。免费浏览，无需登录；搜索与筛选在本地完成。
              </p>

              <div className="relative mt-7 max-w-[560px]">
                <div className="relative flex h-14 items-center rounded-xl border border-border bg-card shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] transition-shadow focus-within:ring-2 focus-within:ring-brand/35 focus-within:ring-offset-2 focus-within:ring-offset-background">
                  <Search
                    className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    ref={searchRef}
                    type="search"
                    value={filters.query}
                    onChange={(event) =>
                      updateFilters((previous) => ({
                        ...previous,
                        query: event.target.value,
                      }))
                    }
                    placeholder="搜索所有工具…"
                    aria-label="搜索 AI 工具"
                    autoComplete="off"
                    spellCheck={false}
                    className="h-14 rounded-xl border-0 bg-transparent pr-20 pl-11 text-[15px] shadow-none focus-visible:ring-0"
                  />
                  {filters.query ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateFilters((previous) => ({
                          ...previous,
                          query: "",
                        }))
                      }
                      aria-label="清空搜索"
                      className="absolute right-1.5 flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new Event("open-search"))
                      }
                      aria-label="打开快速搜索"
                      className="absolute right-2 hidden h-8 items-center rounded-md border border-border bg-muted/40 px-2 font-sans text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none sm:flex"
                    >
                      ⌘K
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <a
                  href="#all-tools"
                  className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none"
                >
                  浏览全部工具
                  <ArrowDown className="size-3.5" aria-hidden />
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none"
                >
                  收录标准
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
                {tools[0] ? (
                  <a
                    href={tools[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                  >
                    本周王牌：{tools[0].name}
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="relative hidden lg:col-span-5 lg:block">
              <FeaturedPanel tools={tools} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="all-tools"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:scroll-mt-24 sm:px-6 lg:px-8"
      >
        <p className="sr-only" aria-live="polite">
          {filtered.length} 个工具
        </p>
        <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:top-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-2 py-3">
            <div className="min-w-0 flex-1 sm:hidden">
              <Select
                value={activeCategory ?? "all"}
                onValueChange={selectCategory}
              >
                <SelectTrigger
                  aria-label="按分类筛选"
                  className="h-10 w-full rounded-full border-border bg-background px-3 text-[12px] shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    全部分类 · {categoryFacet.length}
                  </SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label} ·{" "}
                      {categoryCounts.get(category.value) ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ToggleGroup
              type="single"
              value={activeCategory ?? "all"}
              onValueChange={selectCategory}
              aria-label="按分类筛选"
              className="hidden min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex"
            >
              <ToggleGroupItem
                value="all"
                aria-label={`全部，${categoryFacet.length} 个工具`}
                className={tabClass(!activeCategory)}
                onKeyDown={(event) => handleCategoryKeyDown(event, 0)}
              >
                全部
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {categoryFacet.length}
                </span>
              </ToggleGroupItem>
              {CATEGORIES.map((category) => {
                const count = categoryCounts.get(category.value) ?? 0;
                return (
                  <ToggleGroupItem
                    key={category.value}
                    value={category.value}
                    aria-label={`${category.label}，${count} 个工具`}
                    className={tabClass(activeCategory === category.value)}
                    onKeyDown={(event) =>
                      handleCategoryKeyDown(
                        event,
                        CATEGORIES.findIndex(
                          (item) => item.value === category.value,
                        ) + 1,
                      )
                    }
                  >
                    {category.label}
                    <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>

            <FilterSheet
              pricing={filters.pricing}
              openSource={filters.openSource}
              pricingCounts={pricingCounts}
              pricingTotal={pricingFacet.length}
              sourceTotal={sourceFacet.length}
              openSourceCount={openSourceCount}
              resultCount={filtered.length}
              onPricingChange={(value) =>
                updateFilters((previous) => ({ ...previous, pricing: value }))
              }
              onOpenSourceChange={(value) =>
                updateFilters((previous) => ({
                  ...previous,
                  openSource: value,
                }))
              }
              onReset={() =>
                updateFilters((previous) => ({
                  ...previous,
                  pricing: "all",
                  openSource: "all",
                }))
              }
            />
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={copyCurrentView}
                aria-label={copied ? "链接已复制" : "复制当前筛选链接"}
                title={copied ? "链接已复制" : "复制当前筛选链接"}
                className="size-10 shrink-0 text-muted-foreground"
              >
                {copied ? (
                  <Check className="size-4 text-brand" aria-hidden />
                ) : (
                  <Share2 className="size-4" aria-hidden />
                )}
              </Button>
            ) : null}
          </div>

          {hasFilters ? (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border py-3">
              <span className="eyebrow mr-1">已筛选</span>
              {filters.categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => removeCategory(category)}
                  className={filterChipClass()}
                  aria-label={`移除分类筛选：${
                    CATEGORIES.find((item) => item.value === category)?.label ??
                    category
                  }`}
                >
                  {CATEGORIES.find((item) => item.value === category)?.label ??
                    category}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
              {filters.pricing !== "all" ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFilters((previous) => ({
                      ...previous,
                      pricing: "all",
                    }))
                  }
                  className={filterChipClass()}
                  aria-label="移除定价筛选"
                >
                  {pricingLabel(filters.pricing)}
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
              {filters.openSource !== "all" ? (
                <button
                  type="button"
                  onClick={() =>
                    updateFilters((previous) => ({
                      ...previous,
                      openSource: "all",
                    }))
                  }
                  className={filterChipClass()}
                  aria-label="移除授权筛选"
                >
                  {filters.openSource === "yes" ? "开源" : "闭源"}
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={resetFilters}
                className="ml-1 inline-flex min-h-8 items-center text-[11px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                清除全部
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
            {resultLabel}
          </h2>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {filtered.length} 个工具
          </p>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <span className="size-1 rounded-full bg-brand" aria-hidden />
              人工编排，排序不代表热度；数据整理于 {DATA_UPDATED_LABEL}。
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border py-20 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground">
              <SearchX className="size-5" aria-hidden />
            </span>
            <h2 className="mt-5 text-[17px] font-semibold">
              没有找到匹配的工具
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-6 text-muted-foreground">
              换一个关键词，或者从下面这些常用筛选重新开始。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-1.5">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => {
                    resetFilters();
                    applySuggestion(suggestion);
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-brand/30 hover:text-foreground"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-5"
            >
              清除全部筛选
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
