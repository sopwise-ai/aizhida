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
  const domain = domainOf(tool.url);

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`打开 ${tool.name} 官网（${platformLabel(tool.platform)} · ${domain}）`}
      aria-label={`${tool.name}：${tool.desc}。${platformLabel(tool.platform)}工具，在新标签页打开 ${domain}`}
      className="group border-border bg-card hover:border-foreground/20 focus-visible:ring-brand/40 focus-visible:ring-offset-background relative flex min-h-[160px] flex-col rounded-xl border p-4 transition-[border-color,box-shadow] duration-150 hover:shadow-[0_12px_30px_-20px_rgba(15,23,42,0.24)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <span className="border-border relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
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
              className="size-[26px] object-contain"
            />
          ) : (
            <span className="bg-foreground text-background flex size-full items-center justify-center text-[12px] font-semibold">
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
              className="text-muted-foreground/50 group-hover:text-brand mt-0.5 size-3.5 shrink-0 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-[13px] leading-5">
            {tool.desc}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[11px] leading-4">
        <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
          {categoryLabel(primaryCategory)}
          <span className="text-border" aria-hidden>
            /
          </span>
          <span
            className={
              tool.pricing === "free"
                ? "text-foreground font-medium"
                : undefined
            }
          >
            {pricingLabel(tool.pricing)}
          </span>
          {tool.openSource ? (
            <>
              <span className="text-border" aria-hidden>
                /
              </span>
              <span>开源</span>
            </>
          ) : null}
        </span>
        <span className="text-muted-foreground max-w-[44%] shrink-0 truncate text-[11px]">
          {domain}
        </span>
      </div>
    </a>
  );
}
