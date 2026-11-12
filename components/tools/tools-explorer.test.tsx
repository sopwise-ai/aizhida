import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { tools } from "@/lib/tools";
import { ToolsExplorer } from "./tools-explorer";

vi.mock("@/components/tools/search-command", () => ({
  SearchCommand: () => null,
}));

// 组件会把筛选状态写进 URL 并在挂载时回读；同文件的 jsdom 共享 location，
// 必须在每个用例后复位，否则上一个用例的筛选会泄漏到下一个。
afterEach(() => {
  window.history.replaceState(null, "", "/");
});

// Radix ToggleGroup 的 roving-focus 组不会暴露 group role，直接按文本点按钮。
function categoryButton(label: string) {
  const items = document.querySelectorAll('[data-slot="toggle-group-item"]');
  const found = Array.from(items).find((item) =>
    item.textContent?.startsWith(label),
  );
  if (!found) throw new Error(`category button not found: ${label}`);
  return found as HTMLElement;
}

describe("tools explorer", () => {
  it("copies the current view link and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ToolsExplorer tools={tools} />);

    // 复制入口只在有筛选条件时出现：先选中一个分类。
    await user.click(categoryButton("写作"));
    await user.click(screen.getByRole("button", { name: "复制当前筛选链接" }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("http://localhost:3000");
    expect(
      await screen.findByRole("button", { name: "链接已复制" }),
    ).toBeInTheDocument();
  });

  it("removes a category via its filter chip", async () => {
    const user = userEvent.setup();
    render(<ToolsExplorer tools={tools} />);

    await user.click(categoryButton("写作"));
    await user.click(
      screen.getByRole("button", { name: "移除分类筛选：写作" }),
    );

    expect(
      await screen.findAllByText("全部工具").then((m) => m.length),
    ).toBeGreaterThan(0);
  });

  it("applies a suggestion chip from the empty state", async () => {
    const user = userEvent.setup();
    render(<ToolsExplorer tools={tools} />);

    // 输入一个必然无结果的词触发空态。
    const search = screen.getAllByPlaceholderText(
      "搜索所有工具…",
    )[0] as HTMLInputElement;
    await user.type(search, "zzz不存在的工具");
    await screen.findByText(/没有找到|换个关键词|未找到/);

    await user.click(screen.getByRole("button", { name: "免费" }));
    expect(await screen.findByText("筛选结果")).toBeInTheDocument();
  });

  it("renders the hero, featured panel and the full grid", () => {
    render(<ToolsExplorer tools={tools} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "只收王牌，一键直达",
    );
    // 本期精选面板 + 工具网格都应出现 ChatGPT。
    expect(screen.getAllByText("ChatGPT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("本期精选").length).toBeGreaterThan(0);
  });

  it("searches and flips the result headline back and forth", async () => {
    const user = userEvent.setup();
    render(<ToolsExplorer tools={tools} />);

    const search = screen.getAllByPlaceholderText(
      "搜索所有工具…",
    )[0] as HTMLInputElement;
    await user.type(search, "聊天");

    expect(await screen.findByText("搜索结果")).toBeInTheDocument();

    await user.clear(search);
    await screen.findAllByText("浏览全部工具");
    expect(screen.getAllByText("全部工具").length).toBeGreaterThan(0);
  });

  it("narrows results when a category is selected", async () => {
    const user = userEvent.setup();
    render(<ToolsExplorer tools={tools} />);

    await user.click(categoryButton("写作"));

    expect(await screen.findByText("筛选结果")).toBeInTheDocument();
    const countText = screen.getAllByText(/\d+ 个工具/)[0] as HTMLElement;
    expect(Number.parseInt(countText.textContent ?? "0", 10)).toBeLessThan(
      tools.length,
    );
  });

  it("restores everything via the 全部 tab", async () => {
    const user = userEvent.setup();
    render(<ToolsExplorer tools={tools} />);

    await user.click(categoryButton("写作"));
    await user.click(categoryButton("全部"));

    await screen.findAllByText("全部工具");
    const countText = screen.getAllByText(/\d+ 个工具/)[0] as HTMLElement;
    expect(Number.parseInt(countText.textContent ?? "0", 10)).toBe(
      tools.length,
    );
  });
});
