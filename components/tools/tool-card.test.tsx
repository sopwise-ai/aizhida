import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Tool } from "@/lib/tool-meta";
import { tools } from "@/lib/tools";
import { ToolCard } from "./tool-card";

const chatgpt = tools.find(
  (tool): tool is Tool => tool.id === "chatgpt",
) as Tool;

afterEach(() => {
  cleanup();
});

describe("tool card", () => {
  it("links to the official site with safety rel", () => {
    render(<ToolCard tool={chatgpt} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", chatgpt.links.website);
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText(chatgpt.tagline)).toBeInTheDocument();
  });

  it("renders the local logo asset for a known tool", () => {
    render(<ToolCard tool={chatgpt} />);
    // chatgpt 有 logo；断言图片以本地路径渲染而非第三方服务。
    const img = screen.getByRole("link").querySelector("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("/logos/"));
  });

  it("renders a fallback for tools without a logo asset", () => {
    const withoutLogo = tools.find(
      (tool) => !tool.links.website.includes("chatgpt"),
    );
    if (!withoutLogo) throw new Error("dataset unexpectedly empty");

    // 直接渲染一个 logo 缺失的最小工具，验证首字母占位。
    render(
      <ToolCard
        tool={{
          ...withoutLogo,
          id: "no-such-logo",
          name: "Test",
        }}
      />,
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
