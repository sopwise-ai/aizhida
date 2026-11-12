import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("error page", () => {
  it("renders fallback copy and reports the error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("boom"), { digest: "d1" });

    render(<ErrorPage error={error} reset={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "页面暂时无法加载" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /重新加载/ }),
    ).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith(error);
  });
});
