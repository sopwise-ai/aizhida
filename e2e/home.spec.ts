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

  test("opens a tool detail page from the card", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "查看 ChatGPT 详情" }).click();

    await expect(page).toHaveURL(/\/tools\/chatgpt$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ChatGPT");
    await expect(page.getByRole("link", { name: /打开官网/ })).toBeVisible();
  });

  test("loads the next batch when scrolling to the bottom", async ({
    page,
  }) => {
    await page.goto("/");

    const cards = page.locator('[data-slot="card"]');
    await expect(cards).toHaveCount(24);

    // 滚动到底部触发 IntersectionObserver；重复滚动以容忍水合延迟。
    await expect
      .poll(
        async () => {
          await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight),
          );
          return cards.count();
        },
        { timeout: 15_000 },
      )
      .toBeGreaterThan(24);
  });

  test("category page lists tools and links into details", async ({ page }) => {
    await page.goto("/c/coding");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "编程 AI 工具",
    );
    await page.getByRole("link", { name: "查看 Cursor 详情" }).click();
    await expect(page).toHaveURL(/\/tools\/cursor$/);
  });

  test("opens the command palette with cmd+k", async ({ page }) => {
    await page.goto("/");
    // 快捷键依赖客户端水合；等标记就绪再按键，避免和水合赛跑。
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    await page.keyboard.press("Meta+k");
    await expect(page.getByPlaceholder(/搜索 \d+ 个工具/)).toBeVisible();
    await page.keyboard.press("Escape");

    // 关闭后焦点回到首页搜索框，而不是 body。
    await expect(page.locator("#tool-search")).toBeFocused();
  });

  test("seeds the palette with the home search query", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    await page.getByPlaceholder("搜索所有工具…").fill("画图");
    await page.keyboard.press("Meta+k");

    await expect(page.locator("[cmdk-input]")).toHaveValue("画图");
  });

  test("filters by platform and feature from the sheet", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^筛选/ }).click();
    await page.getByRole("button", { name: /^网页/ }).click();
    await page.getByRole("button", { name: /多模态/ }).click();
    await page.getByRole("button", { name: /关闭筛选面板/ }).click();

    await expect(page).toHaveURL(/platform=web/);
    await expect(page).toHaveURL(/feature=multimodal/);
    await expect(page.getByRole("heading", { name: /筛选结果/ })).toBeVisible();
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
  });

  test("jumps from a category page into the filtered home view", async ({
    page,
  }) => {
    await page.goto("/c/coding");

    await page.getByRole("link", { name: /在全部工具中筛选/ }).click();

    await expect(page).toHaveURL(/\/\?cat=coding/);
    await expect(page.getByRole("heading", { name: /筛选结果/ })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /移除分类筛选/ }),
    ).toBeVisible();
  });

  test("rotates the featured pick", async ({ page }) => {
    await page.goto("/");

    const featured = page.locator("h2").first();
    const before = await featured.textContent();
    await page.getByRole("button", { name: "换一批精选工具" }).click();
    await expect(featured).not.toHaveText(before ?? "");
  });

  test("labels official entries on the detail page", async ({ page }) => {
    await page.goto("/tools/chatgpt");

    await expect(page.getByRole("heading", { name: "官方入口" })).toBeVisible();
    await expect(page.getByText("官网", { exact: true })).toBeVisible();
    await expect(page.getByText("chatgpt.com")).toBeVisible();
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
