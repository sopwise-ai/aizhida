import { ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { DATA_UPDATED_LABEL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { tools } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-[-0.02em] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <BrandMark className="size-7 text-brand" />
              {SITE_NAME}
            </Link>
            <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
              {SITE_TAGLINE}
              。免费使用，无需登录，无广告；搜索与筛选在浏览器本地完成。
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-border/80 bg-card px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Data · {DATA_UPDATED_LABEL}
            </p>
          </div>

          <div>
            <p className="eyebrow">站点</p>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  全部工具
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  收录标准
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  提交工具
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">数据</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-muted-foreground">
              <li>{tools.length} 个工具</li>
              <li>6 个分类</li>
              <li>0 个广告位</li>
              <li>
                <Link
                  href="/about#privacy"
                  className="transition-colors hover:text-foreground"
                >
                  隐私说明
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/80 pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} · 人工编排，不接付费收录
          </p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5">
              <Sparkles className="size-3" aria-hidden />
              外链直达工具官网
            </p>
            <a
              href="#main"
              className="flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <ArrowUp className="size-3" aria-hidden />
              回到顶部
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
