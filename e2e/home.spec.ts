import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the hero and tool grid", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/AI 直达/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "只收王牌，一键直达",
    );
    await expect(page.getByPlaceholder("搜索所有工具…")).toBeVisible();
  });

  test("search filters the tool list", async ({ page }) => {
    await page.goto("/");

    const search = page.getByPlaceholder("搜索所有工具…");
    await search.fill("聊天");

    // 结果区标题变为“搜索结果”，且 ChatGPT（对话类工具）在结果中。
    await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /ChatGPT/ }).first(),
    ).toBeVisible();
  });

  test("switches between themes", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "切换到深色模式" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "切换到浅色模式" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("persists the selected theme", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "切换到深色模式" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "dark",
    );

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("follows the system color scheme on first visit", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("has no critical accessibility violations", async ({ page }) => {
    await page.goto("/");

    const scan = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]);
    const results = await scan.analyze();
    expect(results.violations).toEqual([]);
  });

  test("exposes security headers", async ({ page }) => {
    const response = await page.goto("/");
    if (!response) throw new Error("page did not load");

    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("renders sitemap and robots", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("<urlset");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap:");
  });
});
