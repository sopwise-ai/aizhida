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
