import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/meta";
import { tools } from "@/lib/tools";
import { SITE_URL } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-11");

  const categoryEntries = CATEGORIES.map((category) => {
    const latest =
      tools
        .filter((tool) => tool.categories.includes(category.value))
        .map((tool) => tool.updatedAt)
        .sort()
        .at(-1) ?? "2026-11-11";

    return {
      url: `${SITE_URL}/c/${category.value}`,
      lastModified: new Date(latest),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  const toolEntries = tools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.id}`,
    lastModified: new Date(tool.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categoryEntries,
    ...toolEntries,
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
