import { ArrowUpRight, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmitForm } from "@/components/submit/submit-form";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "提交工具",
  description:
    "向 AI 直达提交 AI 工具：填写名称、官网、说明、分类、定价与平台信息，实时预览并复制 JSON，通过 GitHub Issue 或邮件提交。不接受付费收录。",
  alternates: { canonical: "/submit" },
};

const steps = [
  {
    title: "填写真实信息",
    description: "名称、官网、一句话说明；分类最多两个，定价与授权方式可核验。",
  },
  {
    title: "复制 JSON",
    description:
      "表单会实时生成符合收录格式的 JSON，复制后在 Issue 中粘贴即可。",
  },
  {
    title: "等待人工核验",
    description: "按收录标准检查官网、可用性与分类，通过后进入下一批更新。",
  },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow">提交工具 · Community submission</p>
        <h1 className="display-title mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          推荐一个值得收录的工具
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {SITE_NAME}{" "}
          不接受付费收录，也没有广告位。提交不等于收录，最终以官网信息和收录标准为准。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            人工核验
          </span>
          <span aria-hidden className="text-border">
            /
          </span>
          <span>不收费用</span>
          <span aria-hidden className="text-border">
            /
          </span>
          <span>不保证收录</span>
        </div>
      </div>

      <SubmitForm />

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <ListChecks className="size-4 text-brand" aria-hidden />
            提交后会发生什么
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-brand font-mono text-[11px] font-semibold text-brand-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">先看看收录标准？</p>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            了解什么会被收录、什么不会，再提交可以少走一步。
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
        >
          查看收录标准
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
