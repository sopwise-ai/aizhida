import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

describe("site footer", () => {
  it("shows the brand, tagline and data freshness", () => {
    render(<SiteFooter />);

    expect(screen.getAllByText("AI 直达").length).toBeGreaterThan(0);
    expect(screen.getByText(/只收王牌，一键直达官网/)).toBeInTheDocument();
    expect(screen.getByText(/2026 年 11 月/)).toBeInTheDocument();
  });

  it("links to every category landing page", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "写作" })).toHaveAttribute(
      "href",
      "/c/writing",
    );
    expect(screen.getByRole("link", { name: "基础设施" })).toHaveAttribute(
      "href",
      "/c/infrastructure",
    );
  });

  it("links to the about and submit pages", () => {
    render(<SiteFooter />);
    expect(
      screen.getAllByRole("link", { name: "收录标准" })[0],
    ).toHaveAttribute("href", "/about");
    expect(
      screen.getAllByRole("link", { name: "提交工具" })[0],
    ).toHaveAttribute("href", "/submit");
  });
});
