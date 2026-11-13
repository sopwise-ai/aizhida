import { ArrowUpRight, ChevronRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolLogo } from "@/components/tools/tool-logo";
import { SITE_URL } from "@/lib/site";
import { SITE_NAME } from "@/lib/site-meta";
import { getToolLogo } from "@/lib/tool-logos";
import {
  categoryLabel,
  featureLabel,
  platformLabel,
  pricingLabel,
  statusLabel,
  typeLabel,
} from "@/lib/tool-meta";
import { getTool, tools } from "@/lib/tools";
import { getVendor } from "@/lib/vendors";

// 85（未来 1000+）个详情页全部在构建期预渲染；未知 id 直接 404，不做按需渲染。
export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) return { title: "工具未找到" };

  const title = `${tool.name}：${tool.tagline.replace(/[。.]$/, "")}`;

  return {
    title,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.id}` },
    openGraph: {
      type: "article",
      url: `/tools/${tool.id}`,
      title,
      description: tool.tagline,
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.tagline,
      images: ["/og.png"],
    },
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = getTool(id);
  if (!tool) notFound();

  const vendor = getVendor(tool.vendorId);
  const primaryCategory = tool.categories[0] ?? "assistant";
  const outbound = tool.affiliateUrl ?? tool.links.website;
  const outboundRel =
    tool.affiliateUrl || tool.sponsored
      ? "sponsored nofollow noopener noreferrer"
      : "noopener noreferrer";

  const secondaryLinks = [
    { label: "GitHub 仓库", href: tool.links.github },
    { label: "官方文档", href: tool.links.docs },
    { label: "定价页", href: tool.links.pricing },
    { label: "应用商店", href: tool.links.store },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href),
  );

  // 同类工具按「共同特性 > 共同平台 > 共同分类」排序，比按数组顺序更相关。
  const related = tools
    .filter(
      (candidate) =>
        candidate.id !== tool.id &&
        candidate.categories.some((category) =>
          tool.categories.includes(category),
        ),
    )
    .map((candidate) => ({
      tool: candidate,
      shared: candidate.features.filter((feature) =>
        tool.features.includes(feature),
      ),
      score:
        candidate.features.filter((feature) => tool.features.includes(feature))
          .length *
          3 +
        candidate.platforms.filter((platform) =>
          tool.platforms.includes(platform),
        ).length +
        candidate.categories.filter((category) =>
          tool.categories.includes(category),
        ).length,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  // 头部已经展示厂商/形态/定价/开源，这里只保留头部没有的事实，避免同一页重复。
  const metaRows = [
    {
      label: "使用平台",
      value: tool.platforms.map(platformLabel).join(" · "),
    },
    { label: "状态", value: statusLabel(tool.status) },
    { label: "收录时间", value: tool.addedAt },
    { label: "最近核对", value: tool.verifiedAt },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "全部工具",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryLabel(primaryCategory),
            item: `${SITE_URL}/c/${primaryCategory}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: `${SITE_URL}/tools/${tool.id}`,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description,
        url: tool.links.website,
        applicationCategory: categoryLabel(primaryCategory),
        operatingSystem: tool.platforms.map(platformLabel).join("、"),
        featureList: tool.features.map(featureLabel).join("、"),
        isAccessibleForFree:
          tool.pricing === "free" || tool.pricing === "freemium",
        dateModified: tool.updatedAt,
        publisher: {
          "@type": "Organization",
          name: vendor?.name ?? tool.vendorId,
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <JsonLd data={jsonLd} />

      <nav aria-label="面包屑" className="text-muted-foreground text-[12px]">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground rounded-sm">
              全部工具
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li>
            <Link
              href={`/c/${primaryCategory}`}
              className="hover:text-foreground rounded-sm"
            >
              {categoryLabel(primaryCategory)}
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li aria-current="page" className="text-foreground">
            {tool.name}
          </li>
        </ol>
      </nav>

      <header className="border-border bg-card mt-4 rounded-2xl border p-5 shadow-[0_0_0_1px_rgba(25,23,33,0.03),0_24px_60px_-40px_rgba(76,29,149,0.18)] sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <span className="border-border bg-background flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
            <ToolLogo
              tool={{ name: tool.name, logo: getToolLogo(tool.id) ?? null }}
              iconSize={36}
            />
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-[-0.035em] sm:text-[28px]">
              {tool.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-[13px]">
              {vendor?.name ?? tool.vendorId} · {typeLabel(tool.type)}
            </p>
            <p className="text-muted-foreground mt-3 max-w-2xl text-[14px] leading-6">
              {tool.tagline}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {tool.categories.map((category) => (
            <Link
              key={category}
              href={`/c/${category}`}
              className="border-border bg-muted/50 text-muted-foreground hover:border-brand/40 hover:text-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-medium transition-colors"
            >
              {categoryLabel(category)}
            </Link>
          ))}
          <span className="border-border bg-background text-muted-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px]">
            {pricingLabel(tool.pricing)}
          </span>
          {tool.openSource ? (
            <span className="border-border bg-background text-muted-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px]">
              开源
            </span>
          ) : null}
          {tool.status !== "active" ? (
            <span className="border-border bg-background text-destructive inline-flex h-6 items-center rounded-md border px-2 text-[11px]">
              {statusLabel(tool.status)}
            </span>
          ) : null}
        </div>

        <div className="border-border mt-5 flex flex-wrap items-center gap-2 border-t pt-5">
          <a
            href={outbound}
            target="_blank"
            rel={outboundRel}
            className="bg-primary text-primary-foreground hover:bg-brand focus-visible:ring-brand/40 inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            打开官网
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          {secondaryLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground focus-visible:ring-brand/35 inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {link.label}
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          ))}
          {tool.sponsored ? (
            <span className="text-muted-foreground text-[11px]">赞助收录</span>
          ) : null}
        </div>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              这个工具能做什么
            </h2>
            <p className="text-muted-foreground mt-3 text-[13px] leading-7">
              {tool.description}
            </p>
          </section>

          <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              能力标签
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tool.features.map((feature) => (
                <li
                  key={feature}
                  className="border-border bg-muted/40 text-muted-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px]"
                >
                  {featureLabel(feature)}
                </li>
              ))}
            </ul>
            {tool.keywords.length > 0 ? (
              <div className="border-border mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t pt-3">
                <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                  关键词
                </span>
                {tool.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-muted-foreground text-[11px]"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              官方入口
            </h2>
            <ul className="mt-3 flex flex-col divide-y">
              <li>
                <a
                  href={tool.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:text-brand flex items-center gap-3 py-2.5 text-[13px] transition-colors"
                >
                  <span className="text-muted-foreground w-16 shrink-0 text-[11px]">
                    官网
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {new URL(tool.links.website).hostname.replace(/^www\./, "")}
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                </a>
              </li>
              {secondaryLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group hover:text-brand flex items-center gap-3 py-2.5 text-[13px] transition-colors"
                  >
                    <span className="text-muted-foreground w-16 shrink-0 text-[11px]">
                      {link.label}
                    </span>
                    <span className="text-muted-foreground min-w-0 flex-1 truncate text-[11px]">
                      {new URL(link.href).hostname.replace(/^www\./, "")}
                    </span>
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            {secondaryLinks.length === 0 ? (
              <p className="text-muted-foreground border-border mt-1 border-t pt-3 text-[11px] leading-5">
                暂未收录该工具的文档 / 定价 / 仓库直链，以上信息以官网为准。
              </p>
            ) : null}
          </section>
        </div>

        <aside className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            基本信息
          </h2>
          <dl className="mt-3 flex flex-col gap-2.5 text-[12px]">
            {metaRows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3"
              >
                <dt className="text-muted-foreground shrink-0">{row.label}</dt>
                <dd className="text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground border-border mt-4 flex items-start gap-1.5 border-t pt-3 text-[10px] leading-4">
            <ShieldCheck
              className="text-brand mt-0.5 size-3 shrink-0"
              aria-hidden
            />
            信息以官网公开内容为准，最近核对于 {tool.verifiedAt}
            ；发现失效请在提交页反馈。
          </p>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-8">
          <div className="border-border flex items-end justify-between gap-4 border-b pb-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              同类工具
            </h2>
            <Link
              href={`/c/${primaryCategory}`}
              className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-4 hover:underline"
            >
              更多{categoryLabel(primaryCategory)}工具 →
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((entry) => (
              <li key={entry.tool.id}>
                <Link
                  href={`/tools/${entry.tool.id}`}
                  className="border-border bg-card hover:border-brand/40 focus-visible:ring-brand/35 group flex items-start gap-3 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1">
                    <span className="group-hover:text-brand block truncate text-[13px] font-semibold transition-colors">
                      {entry.tool.name}
                    </span>
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-[11px] leading-5">
                      {entry.tool.tagline}
                    </span>
                    {entry.shared.length > 0 ? (
                      <span className="text-muted-foreground/90 mt-1 block truncate text-[10px]">
                        同样支持{" "}
                        {entry.shared.slice(0, 3).map(featureLabel).join(" · ")}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-muted-foreground mt-8 text-[11px] leading-5">
        {SITE_NAME} 收录的是工具本身，不提供下载或代充；价格与功能以官网为准。
      </p>
    </div>
  );
}
