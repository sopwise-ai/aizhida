import { ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { DATA_UPDATED_LABEL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { CATEGORIES } from "@/lib/tool-meta";
import { tools } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="border-border/80 bg-card/40 relative overflow-hidden border-t">
      <div
        aria-hidden
        className="from-brand/5 pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-[-0.02em] focus-visible:ring-2 focus-visible:outline-none"
            >
              <BrandMark className="text-brand size-7" />
              {SITE_NAME}
            </Link>
            <p className="text-muted-foreground mt-3 text-[13px] leading-6">
              {SITE_TAGLINE}
              。免费使用，无需登录，无广告；搜索与筛选在浏览器本地完成。
            </p>
            <p className="border-border/80 bg-card text-muted-foreground mt-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase">
              <span className="bg-brand size-1.5 rounded-full" aria-hidden />
              Data · {DATA_UPDATED_LABEL}
            </p>
          </div>

          <nav aria-label="分类导航">
            <p className="eyebrow">分类</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
              {CATEGORIES.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/c/${category.value}`}
                    className="text-muted-foreground hover:text-brand inline-flex min-h-8 items-center transition-colors"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="站点导航">
            <p className="eyebrow">站点</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-brand inline-flex min-h-9 items-center transition-colors"
                >
                  全部工具
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-brand inline-flex min-h-9 items-center transition-colors"
                >
                  收录标准
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-muted-foreground hover:text-brand inline-flex min-h-9 items-center transition-colors"
                >
                  提交工具
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow">数据</p>
            <ul className="text-muted-foreground mt-4 flex flex-col gap-2.5 text-[13px]">
              <li>{tools.length} 个工具</li>
              <li>{`${CATEGORIES.length} 个分类`}</li>
              <li>0 个广告位</li>
              <li>
                <Link
                  href="/about#privacy"
                  className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
                >
                  隐私说明
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border/80 text-muted-foreground mt-10 flex flex-col gap-3 border-t pt-6 text-[11px] sm:flex-row sm:items-center sm:justify-between">
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
              className="hover:text-brand focus-visible:ring-ring/50 -m-2 flex min-h-9 items-center gap-1 rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
