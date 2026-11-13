import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolCard } from "@/components/tools/tool-card";
import { SITE_URL } from "@/lib/site";
import { SITE_NAME } from "@/lib/site-meta";
import { CATEGORIES } from "@/lib/tool-meta";
import { toolSummaries } from "@/lib/tools";

// 11 个分类落地页全部构建期预渲染；未知分类 404。
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.value }));
}

function findCategory(value: string) {
  return CATEGORIES.find((category) => category.value === value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = findCategory(category);
  if (!meta) return { title: "分类未找到" };

  const count = toolSummaries.filter((tool) =>
    tool.categories.includes(meta.value),
  ).length;
  const title = `${meta.label} AI 工具（${count} 个）`;
  const description = `${meta.description} ${SITE_NAME} 收录 ${count} 个${meta.label}工具，可按定价、平台与是否开源筛选。`;

  return {
    title,
    description,
    alternates: { canonical: `/c/${meta.value}` },
    openGraph: {
      type: "website",
      url: `/c/${meta.value}`,
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = findCategory(category);
  if (!meta) notFound();

  const items = toolSummaries.filter((tool) =>
    tool.categories.includes(meta.value),
  );
  const others = CATEGORIES.filter((item) => item.value !== meta.value);

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
            name: meta.label,
            item: `${SITE_URL}/c/${meta.value}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `${meta.label} AI 工具`,
        description: meta.description,
        url: `${SITE_URL}/c/${meta.value}`,
        numberOfItems: items.length,
        hasPart: {
          "@type": "ItemList",
          itemListElement: items.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: `${SITE_URL}/tools/${tool.id}`,
          })),
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <JsonLd data={jsonLd} />

      <nav aria-label="面包屑" className="text-muted-foreground text-[12px]">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground rounded-sm">
              全部工具
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li aria-current="page" className="text-foreground">
            {meta.label}
          </li>
        </ol>
      </nav>

      <header className="mt-4 max-w-3xl">
        <p className="eyebrow">分类 · Category</p>
        <h1 className="display-title text-foreground mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          {meta.label} AI 工具
        </h1>
        <p className="text-muted-foreground mt-4 text-[14px] leading-7">
          {meta.description}
        </p>
        <p className="text-muted-foreground mt-2 text-[12px]">
          共收录{" "}
          <span className="text-foreground font-medium">{items.length}</span>{" "}
          个工具，按人工编排排序，不代表热度。
        </p>
        <Link
          href={`/?cat=${meta.value}#all-tools`}
          className="border-border bg-background hover:border-brand/40 hover:text-foreground focus-visible:ring-brand/35 mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          在全部工具中筛选「{meta.label}」
          <ChevronRight aria-hidden className="size-3" />
        </Link>
      </header>

      <nav aria-label="其他分类" className="mt-6 flex flex-wrap gap-1.5">
        {others.map((item) => (
          <Link
            key={item.value}
            href={`/c/${item.value}`}
            className="border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground inline-flex h-8 items-center rounded-lg border px-2.5 text-[12px] transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="sr-only">{meta.label}工具列表</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((tool) => (
          <ToolCard key={tool.id} tool={tool} categoryContext={meta.value} />
        ))}
      </div>

      <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <p className="text-muted-foreground text-[11px] leading-5">
          {SITE_NAME} 只收录可核验官网与定价的{meta.label}工具；排序为人工编排。
        </p>
        <div className="flex items-center gap-4 text-[12px]">
          <Link href="/" className="text-brand hover:opacity-80">
            查看全部 {toolSummaries.length} 个工具 →
          </Link>
          <Link
            href="/submit"
            className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            推荐工具
          </Link>
        </div>
      </div>
    </div>
  );
}
