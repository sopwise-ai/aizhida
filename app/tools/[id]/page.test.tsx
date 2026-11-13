import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getTool, tools } from "@/lib/tools";
import ToolDetailPage, { generateMetadata, generateStaticParams } from "./page";

const chatgpt = getTool("chatgpt");
if (!chatgpt) throw new Error("chatgpt missing from dataset");

function params(id: string) {
  return Promise.resolve({ id });
}

describe("tool detail page", () => {
  it("pre-renders every tool", () => {
    const entries = generateStaticParams();
    expect(entries).toHaveLength(tools.length);
    expect(entries).toContainEqual({ id: "chatgpt" });
  });

  it("renders the long description and the official link", async () => {
    const ui = await ToolDetailPage({ params: params("chatgpt") });
    render(ui);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "ChatGPT",
    );
    expect(screen.getByText(chatgpt.description)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /打开官网/ })).toHaveAttribute(
      "href",
      chatgpt.links.website,
    );
    expect(screen.getAllByText(/最近核对/).length).toBeGreaterThan(0);
  });

  it("builds canonical metadata for search engines", async () => {
    const meta = await generateMetadata({ params: params("chatgpt") });
    expect(meta.alternates?.canonical).toBe("/tools/chatgpt");
    expect(String(meta.title)).toContain("ChatGPT");
    expect(meta.description).toBe(chatgpt.description);
  });

  it("links related tools to their own detail pages", async () => {
    const ui = await ToolDetailPage({ params: params("cursor") });
    render(ui);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href?.startsWith("/tools/")));

    expect(hrefs.length).toBeGreaterThan(1);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("emits SoftwareApplication structured data", async () => {
    const ui = await ToolDetailPage({ params: params("chatgpt") });
    const { container } = render(ui);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    if (!script) throw new Error("json-ld missing");

    const data = JSON.parse(script.textContent ?? "{}");
    const app = data["@graph"].find(
      (node: { "@type": string }) => node["@type"] === "SoftwareApplication",
    );
    expect(app.name).toBe("ChatGPT");
    expect(app.url).toBe(chatgpt.links.website);
  });
});
