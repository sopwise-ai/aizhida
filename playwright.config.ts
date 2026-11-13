import { defineConfig, devices } from "@playwright/test";

const port = 3123;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // 本地没有下载 Playwright 浏览器时可用系统 Chrome：
    // PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e（CI 不设置，保持默认 chromium）
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    // CI 的 e2e job 已完成生产构建（PLAYWRIGHT_SKIP_BUILD=1 时只启动）；
    // 本地单独跑 test:e2e 时仍会先构建，保证开箱即用。
    command: process.env.PLAYWRIGHT_SKIP_BUILD
      ? "pnpm run start"
      : "pnpm run build && pnpm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // 本地 e2e 的构建不能走生产域名校验，也不能落到默认 localhost 值，
      // 用保留域 example.com 满足“生产 URL 必填且非 localhost”。
      NEXT_PUBLIC_SITE_URL: "https://e2e.example.com",
      PORT: String(port),
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
