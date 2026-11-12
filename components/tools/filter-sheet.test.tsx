import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Pricing } from "@/lib/tool-meta";
import { FilterSheet } from "./filter-sheet";

const baseProps = {
  pricing: "all" as const,
  openSource: "all" as const,
  pricingCounts: new Map<Pricing, number>([
    ["free", 12],
    ["freemium", 30],
    ["paid", 8],
    ["trial", 5],
  ]),
  pricingTotal: 55,
  sourceTotal: 18,
  openSourceCount: 18,
  resultCount: 55,
  onPricingChange: vi.fn(),
  onOpenSourceChange: vi.fn(),
  onReset: vi.fn(),
};

describe("filter sheet", () => {
  it("opens and shows pricing and open-source sections", async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...baseProps} />);

    await user.click(screen.getByRole("button", { name: /筛选/ }));
    expect(await screen.findByText("定价")).toBeInTheDocument();
    expect(screen.getByText("仅开源")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /查看 55 个工具/ }),
    ).toBeInTheDocument();
  });

  it("counts active filters on the trigger", () => {
    render(<FilterSheet {...baseProps} pricing="free" openSource="yes" />);
    expect(screen.getByRole("button", { name: /筛选/ })).toHaveTextContent("2");
  });
});
