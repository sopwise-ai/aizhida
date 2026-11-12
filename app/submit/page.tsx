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
        <h1 className="display-title text-foreground mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          推荐一个<span className="text-gradient">值得收录</span>的工具
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-[15px] leading-7">
          {SITE_NAME}{" "}
          不接受付费收录，也没有广告位。提交不等于收录，最终以官网信息和收录标准为准。
        </p>
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-brand size-1.5 rounded-full" aria-hidden />
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

      <section aria-labelledby="submit-steps" className="mt-12">
        <div className="border-border flex items-end justify-between gap-4 border-b pb-3">
          <h2
            id="submit-steps"
            className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]"
          >
            <ListChecks className="text-brand size-4" aria-hidden />
            提交后会发生什么
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="border-border bg-card relative rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-md font-mono text-[11px] font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-[12px] leading-5">
                {step.description}
              </p>
              {index < steps.length - 1 ? (
                <ArrowUpRight
                  aria-hidden
                  className="text-border absolute top-6 right-5 size-4 rotate-45"
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="border-border bg-muted/30 mt-6 flex flex-col gap-3 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">先看看收录标准？</p>
          <p className="text-muted-foreground mt-1 text-[12px] leading-5">
            了解什么会被收录、什么不会，再提交可以少走一步。
          </p>
        </div>
        <Link
          href="/about"
          className="text-brand inline-flex items-center gap-1.5 text-[12px] font-medium hover:underline"
        >
          查看收录标准
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
