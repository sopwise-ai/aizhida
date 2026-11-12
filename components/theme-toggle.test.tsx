import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setThemeMock = vi.fn();

const lightTheme = {
  resolvedTheme: "light",
  setTheme: setThemeMock,
} as unknown as UseThemeProps;

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => lightTheme),
}));

import { type UseThemeProps, useTheme } from "next-themes";

import { ThemeToggle } from "./theme-toggle";
import { TooltipProvider } from "./ui/tooltip";

// DOM 层的主题切换由 Playwright e2e 覆盖；这里用 mock 验证组件自身逻辑。
function renderToggle() {
  return render(
    <TooltipProvider>
      <ThemeToggle />
    </TooltipProvider>,
  );
}

afterEach(() => {
  cleanup();
  setThemeMock.mockClear();
  vi.mocked(useTheme).mockReturnValue(lightTheme);
});

describe("theme toggle", () => {
  it("requests the dark theme from light mode", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button"));
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("requests the light theme from dark mode", () => {
    vi.mocked(useTheme).mockReturnValue({
      ...lightTheme,
      resolvedTheme: "dark",
    });
    renderToggle();
    fireEvent.click(screen.getByRole("button"));
    expect(setThemeMock).toHaveBeenCalledWith("light");
  });

  it("labels the action after the current mode", () => {
    const { unmount } = renderToggle();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "切换到深色模式",
    );
    unmount();

    vi.mocked(useTheme).mockReturnValue({
      ...lightTheme,
      resolvedTheme: "dark",
    });
    renderToggle();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "切换到浅色模式",
    );
  });
});
