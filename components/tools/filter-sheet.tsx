"use client";

import { Check, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FEATURE_GROUPS,
  FEATURES,
  type Feature,
  featureLabel,
  type OpenSourceFilter,
  PLATFORMS,
  type Platform,
  PRICING_OPTIONS,
  type Pricing,
  platformLabel,
  pricingLabel,
} from "@/lib/meta";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  pricing: Pricing | "all";
  openSource: OpenSourceFilter;
  platforms: Platform[];
  features: Feature[];
  pricingCounts: Map<Pricing, number>;
  pricingTotal: number;
  sourceTotal: number;
  openSourceCount: number;
  platformCounts: Map<Platform, number>;
  platformTotal: number;
  featureCounts: Map<Feature, number>;
  featureTotal: number;
  resultCount: number;
  onPricingChange: (value: Pricing | "all") => void;
  onOpenSourceChange: (value: OpenSourceFilter) => void;
  onPlatformToggle: (value: Platform) => void;
  onFeatureToggle: (value: Feature) => void;
  onReset: () => void;
}

const optionClass =
  "focus-visible:ring-brand/35 flex h-10 items-center justify-between rounded-lg border px-3 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";
const chipClass =
  "focus-visible:ring-brand/35 inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";

export function FilterSheet({
  pricing,
  openSource,
  platforms,
  features,
  pricingCounts,
  pricingTotal,
  sourceTotal,
  openSourceCount,
  platformCounts,
  platformTotal,
  featureCounts,
  featureTotal,
  resultCount,
  onPricingChange,
  onOpenSourceChange,
  onPlatformToggle,
  onFeatureToggle,
  onReset,
}: FilterSheetProps) {
  const activeCount =
    Number(pricing !== "all") +
    Number(openSource !== "all") +
    platforms.length +
    features.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-10 shrink-0 rounded-full px-3 text-[12px]",
            activeCount > 0 && "border-brand/40 text-brand",
          )}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
          筛选
          {activeCount > 0 ? (
            <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[9px]">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100%-2rem))]">
        <SheetHeader className="border-border border-b p-5">
          <SheetTitle className="flex items-center gap-2">
            筛选工具
            {activeCount > 0 ? (
              <Badge className="bg-brand-soft text-brand h-5 rounded-full px-1.5 text-[10px]">
                已启用 {activeCount} 项
              </Badge>
            ) : null}
          </SheetTitle>
          <SheetDescription>
            按定价、授权、平台与特性缩小范围，结果会立即更新。
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <section>
            <h3 className="text-muted-foreground text-[12px] font-medium">
              定价
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(
                ["all", ...PRICING_OPTIONS.map((item) => item.value)] as const
              ).map((value) => {
                const active = pricing === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPricingChange(value)}
                    className={cn(
                      optionClass,
                      active
                        ? "border-brand/40 bg-brand-soft text-brand font-medium"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {value === "all" ? "全部定价" : pricingLabel(value)}
                      {active ? <Check className="size-3" aria-hidden /> : null}
                    </span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">
                      {value === "all"
                        ? pricingTotal
                        : (pricingCounts.get(value) ?? 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <Separator className="my-5" />

          <section>
            <h3 className="text-muted-foreground text-[12px] font-medium">
              授权
            </h3>
            <div className="mt-2 grid gap-1.5">
              {(
                [
                  { value: "all", label: "全部授权", count: sourceTotal },
                  { value: "yes", label: "仅开源", count: openSourceCount },
                  {
                    value: "no",
                    label: "仅闭源",
                    count: sourceTotal - openSourceCount,
                  },
                ] as const
              ).map((item) => {
                const active = openSource === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onOpenSourceChange(item.value)}
                    className={cn(
                      optionClass,
                      active
                        ? "border-brand/40 bg-brand-soft text-brand font-medium"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.label}
                      {active ? <Check className="size-3" aria-hidden /> : null}
                    </span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <Separator className="my-5" />

          <section>
            <h3 className="text-muted-foreground text-[12px] font-medium">
              平台
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {PLATFORMS.map((platform) => {
                const active = platforms.includes(platform.value);
                const count = platformCounts.get(platform.value) ?? 0;
                return (
                  <button
                    key={platform.value}
                    type="button"
                    aria-pressed={active}
                    disabled={count === 0 && !active}
                    onClick={() => onPlatformToggle(platform.value)}
                    className={cn(
                      optionClass,
                      active
                        ? "border-brand/40 bg-brand-soft text-brand font-medium"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {platformLabel(platform.value)}
                      {active ? <Check className="size-3" aria-hidden /> : null}
                    </span>
                    <span className="text-muted-foreground text-[10px] tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground mt-2 text-[10px]">
              平台之间是「或」：命中任一已选平台即保留（当前 {platformTotal}{" "}
              个）
            </p>
          </section>

          <Separator className="my-5" />

          <section>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-muted-foreground text-[12px] font-medium">
                特性
              </h3>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {featureTotal} 个工具
              </span>
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto pr-1">
              {FEATURE_GROUPS.map((group) => (
                <div key={group.value} className="mb-3 last:mb-0">
                  <p className="text-muted-foreground mb-1 text-[10px] font-medium">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURES.filter(
                      (feature) => feature.group === group.value,
                    ).map((feature) => {
                      const active = features.includes(feature.value);
                      const count = featureCounts.get(feature.value) ?? 0;
                      return (
                        <button
                          key={feature.value}
                          type="button"
                          aria-pressed={active}
                          aria-label={`${featureLabel(feature.value)}，${count} 个工具`}
                          disabled={count === 0 && !active}
                          onClick={() => onFeatureToggle(feature.value)}
                          className={cn(
                            chipClass,
                            active
                              ? "border-brand/40 bg-brand-soft text-brand font-medium"
                              : "border-border text-muted-foreground hover:bg-muted/60",
                          )}
                        >
                          {featureLabel(feature.value)}
                          <span className="tabular-nums opacity-70">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="border-border bg-card/80 border-t p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground h-10 px-3 text-[12px]"
            >
              重置
            </Button>
            <SheetClose asChild>
              <Button
                type="button"
                className="h-10 flex-1"
                aria-label={`关闭筛选面板，查看 ${resultCount} 个工具`}
              >
                <Check className="size-3.5" aria-hidden />
                查看 {resultCount} 个工具
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
