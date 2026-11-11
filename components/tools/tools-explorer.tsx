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

import { Button, buttonVariants } from "@/components/ui/button";
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
  type OpenSourceFilter,
  PRICING_OPTIONS,
  type Pricing,
  pricingLabel,
  type Tool,
} from "@/lib/tool-meta";
import { cn } from "@/lib/utils";
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

function HeroMark({ tools }: { tools: Tool[] }) {
  const showcase = [
    "chatgpt",
    "midjourney",
    "cursor",
    "claude",
    "notion",
    "deepseek",
  ]
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => Boolean(tool));

  const positions = [
    { left: 12, top: 78, size: 56 },
    { left: 136, top: 24, size: 56 },
    { left: 286, top: 52, size: 56 },
    { left: 48, top: 204, size: 56 },
    { left: 190, top: 130, size: 76 },
    { left: 326, top: 204, size: 56 },
  ];

  return (
    <div
      aria-hidden
      className="relative mx-auto h-[330px] w-full max-w-[430px]"
    >
      <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
      <svg
        viewBox="0 0 430 330"
        className="absolute inset-0 size-full text-brand"
      >
        <title>精选工具</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.13"
          strokeDasharray="2 7"
        >
          <circle cx="215" cy="165" r="108" />
          <circle cx="215" cy="165" r="178" />
          <circle cx="215" cy="165" r="248" />
        </g>
      </svg>

      {showcase.map((tool, index) => {
        const position = positions[index];
        const logo = getToolLogo(tool.id);
        const center = index === 4;
        return (
          <div
            key={tool.id}
            className={cn(
              "absolute flex items-center justify-center overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white",
              center
                ? "z-10 rounded-[18px] shadow-[0_18px_40px_-16px_rgba(15,23,42,0.28)]"
                : "z-0",
            )}
            style={{
              left: position.left,
              top: position.top,
              width: position.size,
              height: position.size,
            }}
          >
            {logo ? (
              // Local brand assets: no runtime favicon request.
              // biome-ignore lint/performance/noImgElement: local, fixed-size brand marks
              <img
                src={logo}
                alt=""
                width={center ? 42 : 30}
                height={center ? 42 : 30}
                loading="eager"
                decoding="async"
                className={
                  center
                    ? "size-[42px] object-contain"
                    : "size-[30px] object-contain"
                }
              />
            ) : (
              <span className="text-[15px] font-semibold">
                {tool.name.slice(0, 1)}
              </span>
            )}
          </div>
        );
      })}
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
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }

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
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
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
      <section className="hero-surface relative overflow-hidden border-b border-border">
        <div aria-hidden className="hero-beams" />
        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 sm:pt-10 sm:pb-10 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground">
                <span>{tools.length} 个工具</span>
                <span className="size-1 rounded-full bg-border" aria-hidden />
                <span>{CATEGORIES.length} 个分类</span>
                <span className="size-1 rounded-full bg-border" aria-hidden />
                <span>本地搜索</span>
                <span className="size-1 rounded-full bg-border" aria-hidden />
                <span>无需登录</span>
              </div>

              <h1 className="display-title mt-5 text-[clamp(2.25rem,4.6vw,3.5rem)] font-bold text-foreground">
                只收王牌，
                <br />
                一键直达。
              </h1>
              <p className="mt-4 max-w-[36rem] text-[14px] leading-6 text-pretty text-muted-foreground sm:text-[15px] sm:leading-7">
                精选真正值得用的 AI
                工具。免费浏览，无需登录；搜索与筛选在本地完成。
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#all-tools"
                  className={buttonVariants({
                    size: "lg",
                    className: "h-10 rounded-lg px-4",
                  })}
                >
                  浏览全部工具
                  <ArrowDown className="size-3.5" aria-hidden />
                </a>
                <Link
                  href="/about"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none"
                >
                  收录标准
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:col-span-5 lg:block">
              <HeroMark tools={tools} />
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[57px] z-30 border-b border-border bg-background sm:static">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-14 items-center focus-within:ring-2 focus-within:ring-brand/40 focus-within:ring-inset sm:h-[72px]">
            <Search
              className="pointer-events-none absolute left-1 size-4 text-muted-foreground"
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
              aria-keyshortcuts="Meta+K Control+K"
              autoComplete="off"
              spellCheck={false}
              className="h-14 rounded-none border-0 bg-transparent pr-20 pl-8 text-[15px] shadow-none focus-visible:ring-0 sm:h-[72px]"
            />
            {filters.query ? (
              <button
                type="button"
                onClick={() =>
                  updateFilters((previous) => ({ ...previous, query: "" }))
                }
                aria-label="清空搜索"
                className="absolute right-0 flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-0 hidden items-center gap-0.5 rounded-md border border-border bg-muted/50 px-2 py-1 font-sans text-[10px] font-medium text-muted-foreground sm:flex">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      <section
        id="all-tools"
        className="mx-auto max-w-7xl scroll-mt-[129px] px-4 py-8 sm:scroll-mt-24 sm:px-6 lg:px-8"
      >
        <p className="sr-only" aria-live="polite">
          {filtered.length} 个工具
        </p>
        <div className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-center xl:justify-between">
          <ToggleGroup
            type="single"
            value={activeCategory ?? "all"}
            onValueChange={selectCategory}
            aria-label="按分类筛选"
            className="flex flex-wrap items-center gap-1.5"
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

          <div className="flex flex-wrap items-center gap-1.5">
            <Select
              value={filters.pricing}
              onValueChange={(value) =>
                updateFilters((previous) => ({
                  ...previous,
                  pricing: value as Pricing | "all",
                }))
              }
            >
              <SelectTrigger
                aria-label="按定价筛选"
                className={cn(
                  "h-10 w-auto gap-1.5 rounded-lg border-border bg-background px-2.5 text-[12px] shadow-none",
                  filters.pricing !== "all" && "border-brand/40 text-brand",
                )}
              >
                <span className="text-muted-foreground">价格</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">
                  全部 · {pricingFacet.length}
                </SelectItem>
                {PRICING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} · {pricingCounts.get(option.value) ?? 0}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.openSource}
              onValueChange={(value) =>
                updateFilters((previous) => ({
                  ...previous,
                  openSource: value as OpenSourceFilter,
                }))
              }
            >
              <SelectTrigger
                aria-label="按授权方式筛选"
                className={cn(
                  "h-10 w-auto gap-1.5 rounded-lg border-border bg-background px-2.5 text-[12px] shadow-none",
                  filters.openSource !== "all" && "border-brand/40 text-brand",
                )}
              >
                <span className="text-muted-foreground">授权</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">全部 · {sourceFacet.length}</SelectItem>
                <SelectItem value="yes">开源 · {openSourceCount}</SelectItem>
                <SelectItem value="no">
                  闭源 · {tools.length - openSourceCount}
                </SelectItem>
              </SelectContent>
            </Select>

            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 gap-1 px-2 text-[11px] text-muted-foreground"
              >
                <X className="size-3" aria-hidden />
                清除
              </Button>
            ) : null}

            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={copyCurrentView}
                aria-label={copied ? "链接已复制" : "复制当前筛选链接"}
                title={copied ? "链接已复制" : "复制当前筛选链接"}
                className="size-10 text-muted-foreground"
              >
                {copied ? (
                  <Check className="size-4 text-brand" aria-hidden />
                ) : (
                  <Share2 className="size-4" aria-hidden />
                )}
              </Button>
            ) : null}

            <p
              className="ml-auto hidden text-[11px] text-muted-foreground tabular-nums sm:block"
              aria-live="polite"
            >
              {filtered.length} 个结果
            </p>
          </div>
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
                  updateFilters((previous) => ({ ...previous, pricing: "all" }))
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
            <output
              aria-live="polite"
              className="ml-auto text-[11px] text-brand"
            >
              {copied ? "筛选链接已复制" : ""}
            </output>
          </div>
        ) : null}

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
