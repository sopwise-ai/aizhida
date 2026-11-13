import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { toolSummaries } from "@/lib/tools";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 首页补站点级结构化数据：品牌名、站点地址与站内搜索入口。
// 搜索词已经通过 ?q= 暴露在 URL 上，SearchAction 因此是真实可用的。
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "zh-CN",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ToolsExplorer tools={toolSummaries} />
    </>
  );
}
