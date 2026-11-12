import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { tools } from "@/lib/tools";
import { SearchCommand } from "./search-command";

describe("search command", () => {
  it("opens with cmd+k and searches by name", async () => {
    const user = userEvent.setup();
    render(<SearchCommand tools={tools} />);

    // 组件监听 window 的 cmd/ctrl+k 快捷键。
    await user.keyboard("{Meta>}k");
    const input = await screen.findByPlaceholderText(
      new RegExp(`搜索 ${tools.length} 个工具`),
    );
    await user.type(input, "ChatGPT");

    expect(await screen.findByText("ChatGPT")).toBeInTheDocument();
  });

  it("opens via the open-search window event", async () => {
    render(<SearchCommand tools={tools} />);
    window.dispatchEvent(new Event("open-search"));

    const input = await screen.findByPlaceholderText(/搜索 \d+ 个工具/);
    expect(input).toBeInTheDocument();
  });
});
