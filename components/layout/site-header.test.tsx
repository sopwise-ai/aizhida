import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "./site-header";

// jsdom 不实现 navigation；mock 路由钩子专注渲染逻辑。
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

import { usePathname } from "next/navigation";

function renderHeader() {
  return render(
    <TooltipProvider>
      <SiteHeader toolCount={42} />
    </TooltipProvider>,
  );
}

describe("site header", () => {
  it("renders the nav links and submit entry", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    renderHeader();

    expect(screen.getByRole("link", { name: /全部工具/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /收录标准/ })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: /提交工具/ })).toHaveAttribute(
      "href",
      "/submit",
    );
  });

  it("shows the brand link with the site name", () => {
    vi.mocked(usePathname).mockReturnValue("/about");
    renderHeader();

    const brand = screen.getAllByRole("link", { name: /AI 直达首页/ })[0];
    expect(brand).toHaveAttribute("href", "/");
  });
});
