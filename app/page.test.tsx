import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

// getServerSideProps 时代的旧用法不会出现；这里验证静态首页直接渲染探索器。
vi.mock("@/components/tools/tools-explorer", () => ({
  ToolsExplorer: ({
    tools,
  }: {
    tools: readonly { id: string; name: string }[];
  }) => (
    <div>
      <h1>只收王牌，一键直达</h1>
      <span data-testid="tool-count">{tools.length}</span>
    </div>
  ),
}));

import { tools } from "@/lib/tools";

describe("home page", () => {
  it("renders the explorer with the full dataset", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "只收王牌，一键直达",
    );
    expect(Number(screen.getByTestId("tool-count").textContent)).toBe(
      tools.length,
    );
  });
});
