import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SubmitPage from "./page";

describe("submit page", () => {
  it("renders the submission intro and form", () => {
    render(<SubmitPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /推荐一个值得收录的工具/,
    );
    // 提交承诺与流程说明必须出现。
    const body = document.body.textContent ?? "";
    expect(body).toContain("人工核验");
    expect(body).toContain("提交后会发生什么");
  });
});
