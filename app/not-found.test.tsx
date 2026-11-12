import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("not found page", () => {
  it("renders 404 copy with links back", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "这个页面不存在" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回首页/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /查看收录标准/ })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
