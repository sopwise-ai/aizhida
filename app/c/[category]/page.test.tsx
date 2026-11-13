import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/tool-meta";
import { toolSummaries } from "@/lib/tools";
import CategoryPage, { generateMetadata, generateStaticParams } from "./page";

const writingTools = toolSummaries.filter((tool) =>
  tool.categories.includes("writing"),
);

function params(category: string) {
  return Promise.resolve({ category });
}

describe("category page", () => {
  it("pre-renders every category", () => {
    const entries = generateStaticParams();
    expect(entries).toHaveLength(CATEGORIES.length);
    expect(entries).toContainEqual({ category: "writing" });
  });

  it("lists every tool in the category with detail links", async () => {
    const ui = await CategoryPage({ params: params("writing") });
    render(ui);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "写作 AI 工具",
    );

    const detailLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/tools/"));
    expect(detailLinks).toHaveLength(writingTools.length);
  });

  it("keeps the category copy and canonical in metadata", async () => {
    const meta = await generateMetadata({ params: params("writing") });

    expect(meta.alternates?.canonical).toBe("/c/writing");
    expect(String(meta.title)).toContain("写作");
    expect(String(meta.description)).toContain("写作");
  });

  it("cross-links the other categories", async () => {
    const ui = await CategoryPage({ params: params("writing") });
    const { container } = render(ui);

    const categoryLinks = Array.from(
      container.querySelectorAll('a[href^="/c/"]'),
    ).map((link) => link.getAttribute("href"));

    expect(categoryLinks).toContain("/c/coding");
    expect(categoryLinks).not.toContain("/c/writing");
  });
});
