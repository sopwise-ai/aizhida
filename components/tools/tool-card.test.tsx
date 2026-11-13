import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { toolSummaries } from "@/lib/tools";
import { ToolCard } from "./tool-card";

const chatgpt = toolSummaries.find((tool) => tool.id === "chatgpt");
if (!chatgpt) throw new Error("chatgpt missing from dataset");

afterEach(() => {
  cleanup();
});

describe("tool card", () => {
  it("links to the official site with safety rel", () => {
    render(<ToolCard tool={chatgpt} />);

    const link = screen.getByRole("link", {
      name: /在新标签页打开 chatgpt\.com/,
    });
    expect(link).toHaveAttribute("href", chatgpt.website);
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText(chatgpt.tagline)).toBeInTheDocument();
  });

  it("keeps one keyboard stop per card", () => {
    render(<ToolCard tool={chatgpt} />);

    // 整卡外链是鼠标主操作，键盘只停在「详情」上，避免长列表 Tab 翻倍。
    const overlay = screen.getByRole("link", {
      name: /在新标签页打开 chatgpt\.com/,
    });
    const detail = screen.getByRole("link", {
      name: `查看 ${chatgpt.name} 详情`,
    });
    expect(overlay).toHaveAttribute("tabindex", "-1");
    expect(detail).not.toHaveAttribute("tabindex");
  });

  it("links to the local detail page", () => {
    render(<ToolCard tool={chatgpt} />);

    const detail = screen.getByRole("link", {
      name: `查看 ${chatgpt.name} 详情`,
    });
    expect(detail).toHaveAttribute("href", `/tools/${chatgpt.id}`);
  });

  it("renders the local logo asset for a known tool", () => {
    const { container } = render(<ToolCard tool={chatgpt} />);
    // chatgpt 有 logo；断言图片以本地路径渲染而非第三方服务。
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("/logos/"));
  });

  it("renders a fallback for tools without a logo asset", () => {
    // 直接渲染一个 logo 缺失的最小工具，验证首字母占位。
    render(
      <ToolCard
        tool={{
          ...chatgpt,
          id: "no-such-logo",
          name: "Test",
          logo: null,
        }}
      />,
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
