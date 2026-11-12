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
  type OpenSourceFilter,
  PRICING_OPTIONS,
  type Pricing,
  pricingLabel,
} from "@/lib/tool-meta";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  pricing: Pricing | "all";
  openSource: OpenSourceFilter;
  pricingCounts: Map<Pricing, number>;
  pricingTotal: number;
  sourceTotal: number;
  openSourceCount: number;
  resultCount: number;
  onPricingChange: (value: Pricing | "all") => void;
  onOpenSourceChange: (value: OpenSourceFilter) => void;
  onReset: () => void;
}

export function FilterSheet({
  pricing,
  openSource,
  pricingCounts,
  pricingTotal,
  sourceTotal,
  openSourceCount,
  resultCount,
  onPricingChange,
  onOpenSourceChange,
  onReset,
}: FilterSheetProps) {
  const activeCount = Number(pricing !== "all") + Number(openSource !== "all");

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
      <SheetContent side="right" className="w-[min(22rem,calc(100%-2rem))]">
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
            按定价和授权方式缩小范围，结果会立即更新。
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
                      "focus-visible:ring-brand/35 flex h-10 items-center justify-between rounded-lg border px-3 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
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
                      "focus-visible:ring-brand/35 flex h-10 items-center justify-between rounded-lg border px-3 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
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
