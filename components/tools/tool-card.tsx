import { ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";

import { categoryLabel, platformLabel, pricingLabel } from "@/lib/tool-meta";
import type { ToolSummary } from "@/lib/tool-summary";
import { ToolLogo } from "./tool-logo";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
  }
}

export function ToolCard({
  tool,
  categoryContext,
}: {
  tool: ToolSummary;
  /** 分类页传入当前分类，避免卡片显示工具的主分类而不是用户正在看的分类。 */
  categoryContext?: ToolSummary["categories"][number];
}) {
  const primaryCategory = categoryContext ?? tool.categories[0] ?? "writing";
  const platformText = tool.platforms.map(platformLabel).join(" · ");
  const domain = domainOf(tool.website);

  return (
    <article
      data-slot="card"
      data-size="default"
      className="group border-border bg-card text-card-foreground hover:border-brand/40 ring-foreground/10 focus-within:border-brand/50 focus-within:ring-brand/30 @container relative flex min-h-[160px] flex-col gap-4 overflow-hidden rounded-xl py-4 ring-1 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-24px_rgba(76,29,149,0.28)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* 整卡点击直达官网：覆盖层链接，避免把「详情」链接嵌在 <a> 里 */}
      <a
        href={tool.website}
        target="_blank"
        rel="noopener noreferrer"
        // 鼠标/触屏的主操作仍是直达官网；键盘只保留「详情」一个停靠点，
        // 避免 48 张卡要按 96 次 Tab。读屏的链接列表里两个链接都还在。
        tabIndex={-1}
        title={`打开 ${tool.name} 官网（${platformText} · ${domain}）`}
        className="focus-visible:ring-brand/40 focus-visible:ring-offset-background absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="sr-only">
          {`${tool.name}，在新标签页打开 ${domain}`}
        </span>
      </a>

      {/* brand glow on hover */}
      <span
        aria-hidden
        className="from-brand/10 pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="pointer-events-none relative z-10 flex items-start gap-3 px-4">
        <span className="border-border bg-background group-hover:border-brand/30 relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors duration-200">
          <ToolLogo tool={tool} iconSize={26} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-[15px] leading-6 font-semibold tracking-[-0.015em]">
              {tool.name}
            </h3>
            <ArrowUpRight
              aria-hidden
              className="text-muted-foreground/50 group-hover:text-brand mt-0.5 size-3.5 shrink-0 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-[13px] leading-5">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-auto px-4">
        <div className="flex items-center justify-between gap-3 pt-3 text-[11px] leading-4">
          <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
            <span className="border-border bg-muted/50 text-muted-foreground group-hover:text-foreground inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-medium whitespace-nowrap transition-colors">
              {categoryLabel(primaryCategory)}
            </span>
            <span
              className={
                tool.pricing === "free"
                  ? "bg-brand-soft text-brand inline-flex h-5 shrink-0 items-center rounded-md px-1.5 font-medium whitespace-nowrap"
                  : undefined
              }
            >
              {pricingLabel(tool.pricing)}
            </span>
            {tool.openSource ? (
              <span className="border-border bg-background text-muted-foreground inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 whitespace-nowrap">
                开源
              </span>
            ) : null}
          </span>
          <span className="text-muted-foreground flex min-w-0 shrink-0 items-center gap-2">
            <Link
              href={`/tools/${tool.id}`}
              aria-label={`查看 ${tool.name} 详情`}
              className="text-brand focus-visible:ring-brand/35 pointer-events-auto inline-flex items-center gap-0.5 rounded-md text-[11px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              详情
              <ChevronRight aria-hidden className="size-3" />
            </Link>
            {/* 卡片过窄时先让位给分类/定价/详情，域名在 title 与详情页仍可见 */}
            <span className="hidden max-w-[92px] truncate @[340px]:inline">
              {domain}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
