import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { DATA_UPDATED_LABEL, SITE_NAME } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "收录标准",
  description:
    "AI 直达的收录标准、数据口径与隐私说明：只收有明确官网、公开可用、信息可核验的 AI 工具；不接受付费上榜。",
  alternates: { canonical: "/about" },
};

const criteria = [
  {
    title: "有明确且可访问的官网",
    description:
      "工具必须有独立的官方站点或官方仓库，链接可正常打开；不收录纯导航页、聚合页和山寨镜像站。",
  },
  {
    title: "产品已公开可用",
    description:
      "核心功能已经对外开放，而不是只有一个概念页、等待名单或无法验证的演示视频。",
  },
  {
    title: "在分类中有稳定价值",
    description:
      "工具需要在写作、绘画、编程、办公、视频或 Agent 中解决一个明确问题，并在公开渠道有真实使用场景或社区反馈。",
  },
  {
    title: "信息可核验且愿意维护",
    description:
      "名称、说明、定价与平台信息以官网公开信息为准；发现失效或明显变化时会被替换或下架。",
  },
];

const rejected = [
  "付费上榜、竞价排名或软文推广",
  "破解版、盗版模型与侵犯版权的内容",
  "没有实际功能的套壳站或纯导流页",
  "无法核验官网、定价或基本信息的工具",
];

const stats = [
  { value: String(tools.length), label: "当前收录" },
  { value: "06", label: "工具分类" },
  { value: "00", label: "广告位" },
  { value: "2026.11", label: "最近整理" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow">收录标准 · Curated by humans</p>
        <h1 className="display-title mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          只收王牌， 不收垃圾。
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {SITE_NAME} 目前收录 {tools.length} 个 AI
          工具。我们不追求数量，也不做长篇评测，只把「这个工具能做什么、官网在哪里」讲清楚。
        </p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-card px-4 py-4">
            <dd className="font-mono text-xl font-medium tracking-[-0.03em] tabular-nums">
              {item.value}
            </dd>
            <dt className="mt-1 text-[11px] text-muted-foreground">
              {item.label}
            </dt>
          </div>
        ))}
      </dl>

      <section id="criteria" className="mt-12">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <ShieldCheck className="size-4 text-brand" aria-hidden />
            收录门槛
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {criteria.map((item, index) => (
            <section
              key={item.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-brand font-mono text-[11px] font-semibold text-brand-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-sm font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {item.description}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
          明确不收录
        </h2>
        <ul className="mt-4 grid gap-2 text-[13px] leading-6 text-muted-foreground sm:grid-cols-2">
          {rejected.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
          本站没有任何付费收录、广告位或返佣链接。排序是人工编排，不代表热度排名。
        </p>
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section
          id="data"
          className="scroll-mt-24 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold">数据口径</h2>
          <ul className="mt-3 space-y-2 text-[12px] leading-6 text-muted-foreground">
            <li>定价只标主要档位：免费、免费增值、付费、试用。</li>
            <li>平台只标最主要的使用方式；多端产品可能有取舍。</li>
            <li>不展示无法核验的 Star 数或热度排名。</li>
            <li>数据整理于 {DATA_UPDATED_LABEL}，价格与功能以官网为准。</li>
          </ul>
        </section>
        <section
          id="privacy"
          className="scroll-mt-24 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <LockKeyhole className="size-3.5" aria-hidden />
            隐私说明
          </h2>
          <ul className="mt-3 space-y-2 text-[12px] leading-6 text-muted-foreground">
            <li>免费使用，无需注册或登录即可浏览、搜索和筛选。</li>
            <li>搜索与筛选在浏览器本地完成，不上报使用数据。</li>
            <li>本站不接入第三方统计，也不设置广告 Cookie。</li>
            <li>点击外链会直接打开工具官网，不经过中转页。</li>
          </ul>
        </section>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">发现了一个值得收录的工具？</p>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            按提交页的模板准备信息，我们会按上面的标准核验。
          </p>
        </div>
        <Link
          href="/submit"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          去提交
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
