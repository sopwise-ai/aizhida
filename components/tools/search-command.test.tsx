import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { toolSummaries } from "@/lib/tools";
import { SearchCommand } from "./search-command";

describe("search command", () => {
  it("opens with cmd+k and searches by name", async () => {
    const user = userEvent.setup();
    render(<SearchCommand tools={toolSummaries} />);

    // 组件监听 window 的 cmd/ctrl+k 快捷键。
    await user.keyboard("{Meta>}k");
    // 面板走 dynamic import，首次打开会多一次异步 chunk 加载。
    const input = await screen.findByPlaceholderText(
      new RegExp(`搜索 ${toolSummaries.length} 个工具`),
      undefined,
      { timeout: 5000 },
    );
    await user.type(input, "ChatGPT");

    expect(await screen.findByText("ChatGPT")).toBeInTheDocument();
  });

  it("opens via the open-search window event", async () => {
    render(<SearchCommand tools={toolSummaries} />);
    window.dispatchEvent(new Event("open-search"));

    const input = await screen.findByPlaceholderText(
      /搜索 \d+ 个工具/,
      undefined,
      { timeout: 5000 },
    );
    expect(input).toBeInTheDocument();
  });
});

describe("search command synonyms", () => {
  it("finds tools by a synonym query, matching the home search", async () => {
    const user = userEvent.setup();
    render(<SearchCommand tools={toolSummaries} />);

    await user.keyboard("{Meta>}k");
    const input = await screen.findByPlaceholderText(
      /搜索 \d+ 个工具/,
      undefined,
      { timeout: 5000 },
    );
    await user.type(input, "画图");

    // 首页检索把「画图」扩展成绘画/图像类；面板必须给出同一批结果，
    // 而不是因为 cmdk 的字面量过滤变成空列表。
    expect(await screen.findByText("Midjourney")).toBeInTheDocument();
    expect(screen.queryByText(/没有找到匹配的工具/)).not.toBeInTheDocument();
  });
});
