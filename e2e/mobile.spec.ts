import { expect, test } from "@playwright/test";

test.describe("mobile navigation", () => {
  test("opens the mobile menu via sheet", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "打开菜单" }).first();
    await trigger.click();

    // Sheet 打开后出现站点标题。
    await expect(
      page.getByRole("heading", { name: "AI 直达" }).first(),
    ).toBeVisible();
  });

  test("search and results remain usable on a small viewport", async ({
    page,
  }) => {
    await page.goto("/");

    const search = page.getByPlaceholder("搜索所有工具…");
    await search.tap();
    await search.fill("绘画");
    await expect(
      page.getByRole("link", { name: /Midjourney|即梦|可灵|LiblibAI/ }).first(),
    ).toBeVisible();
  });
});

test.describe("mobile filters and details", () => {
  test("filters from the mobile sheet", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^筛选/ }).click();
    await page.getByRole("button", { name: /^网页/ }).click();
    await page.getByRole("button", { name: /关闭筛选面板/ }).click();

    await expect(page).toHaveURL(/platform=web/);
    await expect(
      page.getByRole("button", { name: /移除平台筛选/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /筛选结果/ })).toBeVisible();
  });

  test("tool detail page renders on a small viewport", async ({ page }) => {
    await page.goto("/tools/chatgpt");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ChatGPT");
    await expect(page.getByRole("link", { name: /打开官网/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "同类工具" })).toBeVisible();
    // 同类工具带「同样支持」说明，验证排序理由可见。
    await expect(page.getByText(/同样支持/).first()).toBeVisible();
  });
});
