import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Feature, Platform, Pricing } from "@/lib/tool-meta";
import { FilterSheet } from "./filter-sheet";

const baseProps = {
  pricing: "all" as const,
  openSource: "all" as const,
  platforms: [] as Platform[],
  features: [] as Feature[],
  pricingCounts: new Map<Pricing, number>([
    ["free", 12],
    ["freemium", 30],
    ["paid", 8],
    ["trial", 5],
  ]),
  pricingTotal: 55,
  sourceTotal: 18,
  openSourceCount: 18,
  platformCounts: new Map<Platform, number>([
    ["web", 55],
    ["desktop", 20],
    ["mobile", 12],
    ["api", 9],
    ["extension", 4],
  ]),
  platformTotal: 55,
  featureCounts: new Map<Feature, number>([
    ["multimodal", 20],
    ["long-context", 30],
  ]),
  featureTotal: 55,
  resultCount: 55,
  onPricingChange: vi.fn(),
  onOpenSourceChange: vi.fn(),
  onPlatformToggle: vi.fn(),
  onFeatureToggle: vi.fn(),
  onReset: vi.fn(),
};

describe("filter sheet", () => {
  it("opens and shows every filter dimension", async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...baseProps} />);

    await user.click(screen.getByRole("button", { name: /筛选/ }));
    expect(await screen.findByText("定价")).toBeInTheDocument();
    expect(screen.getByText("仅开源")).toBeInTheDocument();
    expect(screen.getByText("平台")).toBeInTheDocument();
    expect(screen.getByText("特性")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /查看 55 个工具/ }),
    ).toBeInTheDocument();
  });

  it("counts active filters on the trigger", () => {
    render(
      <FilterSheet
        {...baseProps}
        pricing="free"
        openSource="yes"
        platforms={["web", "api"]}
        features={["multimodal"]}
      />,
    );
    expect(screen.getByRole("button", { name: /筛选/ })).toHaveTextContent("5");
  });

  it("toggles platform and feature options", async () => {
    const user = userEvent.setup();
    const onPlatformToggle = vi.fn();
    const onFeatureToggle = vi.fn();
    render(
      <FilterSheet
        {...baseProps}
        onPlatformToggle={onPlatformToggle}
        onFeatureToggle={onFeatureToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: /筛选/ }));
    await user.click(await screen.findByRole("button", { name: /网页/ }));
    await user.click(screen.getByRole("button", { name: /多模态，20 个工具/ }));

    expect(onPlatformToggle).toHaveBeenCalledWith("web");
    expect(onFeatureToggle).toHaveBeenCalledWith("multimodal");
  });
});
