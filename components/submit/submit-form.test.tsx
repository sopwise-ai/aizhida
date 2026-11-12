import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SubmitForm } from "./submit-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

afterEach(() => {
  cleanup();
});

describe("submit form", () => {
  it("renders every field with labels", () => {
    render(<SubmitForm />);

    expect(screen.getByLabelText(/工具名称/)).toBeInTheDocument();
    expect(screen.getByLabelText(/官网地址/)).toBeInTheDocument();
    expect(screen.getByLabelText(/一句话说明/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /复制 JSON/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /打开 GitHub Issue/ }),
    ).toBeInTheDocument();
  });

  it("validates required fields on submit", async () => {
    const user = userEvent.setup();
    render(<SubmitForm />);

    await user.click(screen.getByRole("button", { name: /复制 JSON/ }));

    // 必填字段缺失时不应进入复制成功态。
    expect(
      screen.getByRole("button", { name: /复制 JSON/ }),
    ).toBeInTheDocument();
    expect(document.body.textContent).toMatch(/请填写|必填|不能为空/);
  });

  it("generates valid JSON preview from a filled form", async () => {
    const user = userEvent.setup();
    render(<SubmitForm />);

    await user.type(screen.getByLabelText(/工具名称/), "Test Tool");
    await user.type(screen.getByLabelText(/官网地址/), "https://example.com");
    await user.type(
      screen.getByLabelText(/一句话说明/),
      "一个用于验证表单流程的测试工具",
    );

    const preview = document.body.textContent ?? "";
    expect(preview).toContain("test-tool");
    expect(preview).toContain("https://example.com");
  });
});
