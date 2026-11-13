"use client";

import {
  ArrowDown,
  ArrowUpRight,
  Check,
  RefreshCw,
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

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
  CATEGORIES,
  type Category,
  categoryLabel,
  type Feature,
  featureLabel,
  type OpenSourceFilter,
  type Platform,
  type Pricing,
  platformLabel,
  pricingLabel,
} from "@/lib/meta";
import {
  filterTools,
  isCategory,
  isFeature,
  isPlatform,
  isPricing,
  type ToolFilters,
} from "@/lib/search";
import { DATA_UPDATED_LABEL } from "@/lib/site";
import type { ToolSummary } from "@/lib/summary";
import { cn } from "@/lib/utils";
import { FilterSheet } from "./filter-sheet";
import { SearchCommand } from "./search-command";
import { ToolCard } from "./tool-card";
import { ToolLogo } from "./tool-logo";

const PAGE_SIZE = 24;

const EMPTY_FILTERS: ToolFilters = {
  query: "",
  categories: [],
  pricing: "all",
  openSource: "all",
  platforms: [],
  features: [],
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
  const platforms = (params.get("platform") ?? "")
    .split(",")
    .filter(isPlatform);
  const features = (params.get("feature") ?? "").split(",").filter(isFeature);

  return {
    query: params.get("q") ?? "",
    categories,
    pricing: isPricing(price) ? price : "all",
    openSource:
      source === "yes" || source === "no"
        ? (source as OpenSourceFilter)
        : "all",
    platforms,
    features,
  };
}

function writeFiltersToUrl(filters: ToolFilters, replace: boolean) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.categories.length)
    params.set("cat", filters.categories.join(","));
  if (filters.pricing !== "all") params.set("price", filters.pricing);
  if (filters.openSource !== "all") params.set("source", filters.openSource);
  if (filters.platforms.length)
    params.set("platform", filters.platforms.join(","));
  if (filters.features.length)
    params.set("feature", filters.features.join(","));

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

const FEATURED_POOL = [
  "chatgpt",
  "midjourney",
  "cursor",
  "deepseek",
  "claude",
  "notion-ai",
  "runway",
  "perplexity",
  "kimi",
  "canva",
  "elevenlabs",
  "gamma",
];

function FeaturedPanel({ tools }: { tools: ToolSummary[] }) {
  const [offset, setOffset] = useState(0);

  const pool = useMemo(() => {
    const picked = FEATURED_POOL.map((id) =>
      tools.find((tool) => tool.id === id),
    ).filter((tool): tool is ToolSummary => tool !== undefined);
    return picked.length >= 4 ? picked : tools.slice(0, 8);
  }, [tools]);

  // 每次换 3 个，保证主推位和三条副位都换新。
  const rotated = useMemo(
    () => [
      ...pool.slice(offset % pool.length),
      ...pool.slice(0, offset % pool.length),
    ],
    [pool, offset],
  );
  const primary = rotated[0];
  const rows = rotated.slice(1, 4);

  if (!primary) return null;

  return (
    <div className="border-border bg-card w-full max-w-[420px] rounded-2xl border p-2 shadow-[0_0_0_1px_rgba(25,23,33,0.03),0_24px_60px_-30px_rgba(76,29,149,0.18)] lg:ml-auto">
      <div
        key={primary.id}
        className="border-border bg-card/90 animate-panel-in overflow-hidden rounded-xl border backdrop-blur"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <span className="text-muted-foreground font-mono text-[9px] tracking-[0.16em] uppercase">
            本期精选
          </span>
          <button
            type="button"
            onClick={() => setOffset((value) => (value + 3) % pool.length)}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-brand/35 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="换一批精选工具"
          >
            <RefreshCw className="size-3" aria-hidden />
            换一批
          </button>
        </div>

        <a
          href={primary.website}
          target="_blank"
          rel="noopener noreferrer"
          className="group hover:bg-accent/30 focus-visible:ring-brand/35 relative block p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span
            aria-hidden
            className="bg-brand absolute inset-y-4 left-0 w-0.5 rounded-full"
          />
          <div className="flex items-start gap-3">
            <span className="border-border bg-background flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border">
              <ToolLogo tool={primary} iconSize={28} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="bg-brand-soft text-brand inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-medium tracking-[0.06em]">
                编辑推荐
              </p>
              <h2 className="mt-1.5 truncate text-[18px] font-semibold tracking-[-0.025em]">
                {primary.name}
              </h2>
              <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                {categoryLabel(primary.categories[0] ?? "assistant")} ·{" "}
                {pricingLabel(primary.pricing)}
                {primary.openSource ? " · 开源" : ""}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden
              className="text-muted-foreground mt-1 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <p className="text-muted-foreground mt-3 line-clamp-2 text-[13px] leading-5">
            {primary.tagline}
          </p>
          <div className="border-border mt-3 flex items-center justify-end gap-3 border-t pt-3">
            <span className="bg-primary text-primary-foreground group-hover:bg-brand inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors">
              打开官网
              <ArrowUpRight className="size-3" aria-hidden />
            </span>
          </div>
        </a>

        <div className="border-border border-t">
          {rows.map((tool) => {
            return (
              <a
                key={tool.id}
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border hover:bg-accent/30 focus-visible:ring-brand/35 flex items-center gap-2.5 border-b px-4 py-2.5 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
              >
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-[5px]">
                  <ToolLogo tool={tool} iconSize={20} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {tool.name}
                </span>
                <span className="text-muted-foreground hidden text-[10px] sm:inline">
                  {categoryLabel(tool.categories[0] ?? "assistant")}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {pricingLabel(tool.pricing)}
                </span>
                <ArrowUpRight
                  className="text-muted-foreground size-3"
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

export function ToolsExplorer({ tools }: { tools: ToolSummary[] }) {
  const [filters, setFilters] = useState<ToolFilters>(EMPTY_FILTERS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ioUnavailable, setIoUnavailable] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const historyReady = useRef(false);
  const lastQuery = useRef(filters.query);
  const searchRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => filterTools(tools, filters), [tools, filters]);

  // 1000 条数据也不把全部卡片塞进 DOM：首屏 24 张，按批追加。
  // 分页状态带上筛选指纹，筛选一变就自动回到第一批，不需要额外的重置 effect。
  const filterKey = `${filters.query}|${filters.categories.join(",")}|${filters.pricing}|${filters.openSource}|${filters.platforms.join(",")}|${filters.features.join(",")}`;
  const [pagination, setPagination] = useState({
    key: filterKey,
    count: PAGE_SIZE,
  });
  const visibleCount =
    pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const visibleTools = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

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

  const platformFacet = useMemo(
    () => filterTools(tools, { ...filters, platforms: [] }),
    [tools, filters],
  );

  const featureFacet = useMemo(
    () => filterTools(tools, { ...filters, features: [] }),
    [tools, filters],
  );

  const platformCounts = useMemo(() => {
    const counts = new Map<Platform, number>();
    for (const tool of platformFacet) {
      for (const platform of tool.platforms) {
        counts.set(platform, (counts.get(platform) ?? 0) + 1);
      }
    }
    return counts;
  }, [platformFacet]);

  const featureCounts = useMemo(() => {
    const counts = new Map<Feature, number>();
    for (const tool of featureFacet) {
      for (const feature of tool.features) {
        counts.set(feature, (counts.get(feature) ?? 0) + 1);
      }
    }
    return counts;
  }, [featureFacet]);

  useEffect(() => {
    setFilters(readFiltersFromUrl());
    setHydrated(true);
  }, []);

  // 浏览器不支持 IntersectionObserver 时退化为手动按钮（jsdom 测试也走这条路）。
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") setIoUnavailable(true);
  }, []);

  // 滚到底部自动追加下一批：rootMargin 提前 600px 触发，避免用户看到空档。
  useEffect(() => {
    // 首个 commit 里 ioUnavailable 还是 false，必须同时做运行时判断。
    if (ioUnavailable || typeof IntersectionObserver === "undefined") return;
    const node = loadMoreRef.current;
    if (!node || visibleCount >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setPagination((previous) =>
          previous.key === filterKey
            ? { key: filterKey, count: previous.count + PAGE_SIZE }
            : { key: filterKey, count: PAGE_SIZE * 2 },
        );
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ioUnavailable, visibleCount, filtered.length, filterKey]);

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
    filters.openSource !== "all" ||
    filters.platforms.length > 0 ||
    filters.features.length > 0;

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
    const value = values[next];
    if (value !== undefined) selectCategory(value);
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

  function togglePlatform(platform: Platform) {
    updateFilters((previous) => ({
      ...previous,
      platforms: previous.platforms.includes(platform)
        ? previous.platforms.filter((item) => item !== platform)
        : [...previous.platforms, platform],
    }));
  }

  function toggleFeature(feature: Feature) {
    updateFilters((previous) => ({
      ...previous,
      features: previous.features.includes(feature)
        ? previous.features.filter((item) => item !== feature)
        : [...previous.features, feature],
    }));
  }

  const resultLabel = filters.query.trim()
    ? "搜索结果"
    : hasFilters
      ? "筛选结果"
      : "全部工具";

  return (
    // data-hydrated 供 e2e 判断客户端是否已接管（快捷键、⌘K 面板依赖水合）。
    <div data-hydrated={hydrated ? "true" : "false"}>
      <SearchCommand tools={tools} />
      <section className="hero-surface border-border relative overflow-hidden border-b">
        <div className="relative mx-auto max-w-7xl px-4 pt-[calc(3.5rem+1.75rem)] pb-10 sm:px-6 sm:pt-[calc(5rem+3rem)] lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <span className="border-border bg-background/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] backdrop-blur">
                <span
                  className="bg-brand relative flex size-1.5 rounded-full"
                  aria-hidden
                >
                  <span className="bg-brand absolute inset-0 animate-ping rounded-full opacity-60" />
                </span>
                人工编排 · 无需登录
              </span>
              <h1 className="display-title text-foreground mt-5 text-[clamp(2.1rem,8vw,4.25rem)] leading-[1.04] font-bold tracking-[-0.035em]">
                只收<span className="text-gradient">王牌</span>，
                <br />
                一键直达
              </h1>
              <p className="text-muted-foreground mt-4 max-w-[34rem] text-[14px] leading-6 text-pretty sm:text-[15px] sm:leading-7">
                精选真正值得用的 AI
                工具。免费浏览，无需登录；搜索与筛选在本地完成。
              </p>

              <div className="relative mt-7 max-w-[560px]">
                <div className="border-border bg-card focus-within:ring-brand/35 focus-within:ring-offset-background focus-within:border-brand/50 relative flex h-14 items-center rounded-xl border shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow] focus-within:shadow-[0_24px_70px_-28px_var(--brand-soft)] focus-within:ring-2 focus-within:ring-offset-2">
                  <Search
                    className="text-muted-foreground pointer-events-none absolute left-4 size-4"
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
                    id="tool-search"
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
                      className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-brand/35 absolute right-1.5 flex size-10 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new Event("open-search"))
                      }
                      aria-label="⌘K 打开快速搜索"
                      className="border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-brand/35 absolute right-2 hidden h-8 items-center rounded-md border px-2 font-sans text-[10px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:flex"
                    >
                      ⌘K
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <a
                  href="#all-tools"
                  className="border-border bg-card hover:border-brand/40 focus-visible:ring-brand/35 inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 font-medium shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  浏览全部工具
                  <ArrowDown className="size-3.5" aria-hidden />
                </a>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-brand/35 inline-flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  收录标准
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
                {tools[0] ? (
                  <a
                    href={tools[0].website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex w-full items-center gap-1.5 transition-colors sm:w-auto lg:hidden"
                  >
                    本期精选：{tools[0].name}
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

      {tools.length > 8 ? (
        <div
          aria-hidden
          className="border-border relative overflow-hidden border-b py-5"
        >
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
          <div className="animate-marquee flex w-max items-center gap-3">
            {(["a", "b"] as const).flatMap((copy) =>
              tools
                .filter((tool) => tool.logo)
                .slice(0, 16)
                .map((tool) => (
                  // 复制一份整表做无缝循环，copy 前缀保证两组 key 不重复。
                  <span
                    key={`${tool.id}-${copy}`}
                    className="border-border bg-card flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-xs"
                  >
                    <ToolLogo tool={tool} iconSize={20} />
                  </span>
                )),
            )}
          </div>
        </div>
      ) : null}

      <section
        id="all-tools"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:scroll-mt-24 sm:px-6 lg:px-8"
      >
        <p className="sr-only" aria-live="polite">
          {filtered.length} 个工具，已显示 {visibleTools.length} 个
        </p>
        <div className="border-border bg-background/95 sticky top-14 z-20 -mx-4 border-b px-4 backdrop-blur sm:top-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-2 py-3">
            <div className="min-w-0 flex-1 sm:hidden">
              <Select
                value={activeCategory ?? "all"}
                onValueChange={selectCategory}
              >
                <SelectTrigger
                  aria-label="按分类筛选"
                  className="border-border bg-background h-10 w-full rounded-full px-3 text-[12px] shadow-none"
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
              className="hidden min-w-0 flex-1 [scrollbar-width:none] flex-nowrap items-center gap-1.5 overflow-x-auto sm:flex"
            >
              <ToggleGroupItem
                value="all"
                aria-label={`全部，${categoryFacet.length} 个工具`}
                className={tabClass(!activeCategory)}
                onKeyDown={(event) => handleCategoryKeyDown(event, 0)}
              >
                全部
                <span className="text-muted-foreground text-[11px] font-normal tabular-nums">
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
                    disabled={count === 0 && activeCategory !== category.value}
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
                    <span className="text-muted-foreground text-[11px] font-normal tabular-nums">
                      {count}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>

            <FilterSheet
              pricing={filters.pricing}
              openSource={filters.openSource}
              platforms={filters.platforms}
              features={filters.features}
              pricingCounts={pricingCounts}
              pricingTotal={pricingFacet.length}
              sourceTotal={sourceFacet.length}
              openSourceCount={openSourceCount}
              platformCounts={platformCounts}
              platformTotal={platformFacet.length}
              featureCounts={featureCounts}
              featureTotal={featureFacet.length}
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
              onPlatformToggle={togglePlatform}
              onFeatureToggle={toggleFeature}
              onReset={() =>
                updateFilters((previous) => ({
                  ...previous,
                  pricing: "all",
                  openSource: "all",
                  platforms: [],
                  features: [],
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
                className="text-muted-foreground size-10 shrink-0"
              >
                {copied ? (
                  <Check className="text-brand size-4" aria-hidden />
                ) : (
                  <Share2 className="size-4" aria-hidden />
                )}
              </Button>
            ) : null}
          </div>

          {hasFilters ? (
            <div className="border-border flex flex-wrap items-center gap-1.5 border-b py-3">
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
              {filters.platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={filterChipClass()}
                  aria-label={`移除平台筛选：${platformLabel(platform)}`}
                >
                  {platformLabel(platform)}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
              {filters.features.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={filterChipClass()}
                  aria-label={`移除特性筛选：${featureLabel(feature)}`}
                >
                  {featureLabel(feature)}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-muted-foreground decoration-border hover:text-foreground ml-1 inline-flex min-h-8 items-center text-[11px] underline underline-offset-4 transition-colors"
              >
                清除全部筛选
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.02em]">
            {resultLabel}
            <span className="bg-brand-soft text-brand inline-flex h-5 items-center rounded-md px-1.5 font-mono text-[11px] font-medium tabular-nums">
              {filtered.length}
            </span>
          </h2>
          <p className="text-muted-foreground text-[11px] tabular-nums">
            {filtered.length} 个工具
          </p>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            {filtered.length > visibleTools.length ? (
              <div
                ref={loadMoreRef}
                className="mt-6 flex flex-col items-center gap-2 py-4"
              >
                {ioUnavailable ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-lg px-4"
                    onClick={() =>
                      setPagination({
                        key: filterKey,
                        count: visibleCount + PAGE_SIZE,
                      })
                    }
                  >
                    再显示{" "}
                    {Math.min(PAGE_SIZE, filtered.length - visibleTools.length)}{" "}
                    个
                  </Button>
                ) : (
                  <>
                    <div
                      role="progressbar"
                      aria-label="已加载工具"
                      aria-valuemin={0}
                      aria-valuemax={filtered.length}
                      aria-valuenow={visibleTools.length}
                      className="bg-border h-1 w-40 overflow-hidden rounded-full"
                    >
                      <div
                        className="bg-brand h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                        style={{
                          width: `${Math.round(
                            (visibleTools.length / filtered.length) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground text-[11px] tabular-nums">
                      继续向下滚动 · 已显示 {visibleTools.length} /{" "}
                      {filtered.length}
                    </p>
                  </>
                )}
              </div>
            ) : filtered.length > PAGE_SIZE ? (
              <p className="text-muted-foreground mt-6 text-center text-[11px]">
                已显示全部 {filtered.length} 个工具
              </p>
            ) : null}
            <p className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
              <span className="bg-brand size-1 rounded-full" aria-hidden />
              人工编排，排序不代表热度；数据整理于 {DATA_UPDATED_LABEL}。
            </p>
          </>
        ) : (
          <Empty className="border-border bg-card/50 mt-5 min-h-80 rounded-xl border border-dashed py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX className="size-4" aria-hidden />
              </EmptyMedia>
              <EmptyTitle className="text-[16px] font-semibold">
                没有找到匹配的工具
              </EmptyTitle>
              <EmptyDescription>
                换一个关键词，或者从下面这些常用筛选重新开始。
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row flex-wrap justify-center">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => {
                    resetFilters();
                    applySuggestion(suggestion);
                  }}
                  className="border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-brand rounded-lg border px-3 py-1.5 text-[12px] transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-1"
              >
                清除全部筛选
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>
    </div>
  );
}
