import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutPage from "./page";

describe("about page", () => {
  it("explains the inclusion criteria", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /只收王牌/,
    );
    // 核心承诺必须出现：人工编排、不接受付费。
    const body = document.body.textContent ?? "";
    expect(body).toContain("人工");
    expect(body).toMatch(/不(接受|收).*费|不接受付费/);
  });

  it("lists multiple criteria sections", () => {
    render(<AboutPage />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBeGreaterThanOrEqual(3);
  });
});
