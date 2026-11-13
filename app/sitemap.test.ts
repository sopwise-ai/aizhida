import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/meta";
import { tools } from "@/lib/tools";
import { SITE_URL } from "@/lib/url";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("covers all static routes with absolute urls", () => {
    const data = sitemap();
    const urls = data.map((entry) => entry.url);

    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/c/writing`);
    expect(urls).toHaveLength(tools.length + CATEGORIES.length + 3);
    expect(urls).toContain(`${SITE_URL}/about`);
    expect(urls).toContain(`${SITE_URL}/submit`);
    for (const url of urls) {
      expect(url.startsWith("http")).toBe(true);
      expect((entryLastModified(data, url) as Date).toString()).not.toBe(
        "Invalid Date",
      );
    }
  });

  it("orders the home page first", () => {
    expect(sitemap()[0]?.url).toBe(SITE_URL);
  });
});

function entryLastModified(
  data: ReturnType<typeof sitemap>,
  url: string,
): unknown {
  return data.find((entry) => entry.url === url)?.lastModified;
}
