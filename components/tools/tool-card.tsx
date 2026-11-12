import { ArrowUpRight } from "lucide-react";

import { getToolLogo } from "@/lib/tool-logos";
import {
  categoryLabel,
  platformLabel,
  pricingLabel,
  type Tool,
} from "@/lib/tool-meta";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
  }
}

export function ToolCard({ tool }: { tool: Tool }) {
  const logo = getToolLogo(tool.id);
  const primaryCategory = tool.categories[0] ?? "writing";
  const platformText = tool.platforms.map(platformLabel).join(" · ");
  const domain = domainOf(tool.links.website);

  return (
    <a
      href={tool.links.website}
      target="_blank"
      rel="noopener noreferrer"
      title={`打开 ${tool.name} 官网（${platformText} · ${domain}）`}
      aria-label={`${tool.name}：${tool.tagline}。${platformText}工具，在新标签页打开 ${domain}`}
      data-slot="card"
      data-size="default"
      className="group border-border bg-card text-card-foreground hover:border-brand/40 focus-visible:ring-brand/40 focus-visible:ring-offset-background ring-foreground/10 relative flex min-h-[160px] flex-col gap-4 overflow-hidden rounded-xl py-4 ring-1 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-24px_rgba(76,29,149,0.28)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* brand glow on hover */}
      <span
        aria-hidden
        className="from-brand/10 pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="flex items-start gap-3 px-4">
        <span className="border-border bg-background group-hover:border-brand/30 relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors duration-200">
          {logo ? (
            // Local brand assets: no runtime favicon service, no third-party request.
            // biome-ignore lint/performance/noImgElement: local, fixed-size brand marks
            <img
              src={logo}
              alt=""
              width={26}
              height={26}
              loading="lazy"
              decoding="async"
              className="size-[26px] object-contain transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
            />
          ) : (
            <span className="bg-primary text-primary-foreground flex size-full items-center justify-center text-[12px] font-semibold">
              {tool.name.slice(0, 1)}
            </span>
          )}
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

      <div className="mt-auto px-4">
        <div className="flex items-center justify-between gap-3 pt-3 text-[11px] leading-4">
          <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
            <span className="border-border bg-muted/50 text-muted-foreground group-hover:text-foreground inline-flex h-5 items-center rounded-md border px-1.5 font-medium transition-colors">
              {categoryLabel(primaryCategory)}
            </span>
            <span
              className={
                tool.pricing === "free"
                  ? "bg-brand-soft text-brand inline-flex h-5 items-center rounded-md px-1.5 font-medium"
                  : undefined
              }
            >
              {pricingLabel(tool.pricing)}
            </span>
            {tool.openSource ? (
              <span className="border-border bg-background text-muted-foreground inline-flex h-5 items-center rounded-md border px-1.5">
                开源
              </span>
            ) : null}
          </span>
          <span className="text-muted-foreground max-w-[44%] shrink-0 truncate text-[11px]">
            {domain}
          </span>
        </div>
      </div>
    </a>
  );
}
