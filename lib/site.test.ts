import { afterEach, describe, expect, it, vi } from "vitest";

import { SITE_URL } from "./site";

/**
 * 这些用例通过 vi.stubEnv + resetModules 重新求值 lib/site.ts，
 * 覆盖「构建期失败」这一唯一但关键的行为。
 */
async function importSiteWith(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import("./site");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SITE_URL", () => {
  it("is an absolute url without a trailing slash", () => {
    expect(SITE_URL).not.toMatch(/\/+$/);
    expect(() => new URL(SITE_URL)).not.toThrow();
  });

  it("normalizes trailing slashes from the configured url", async () => {
    const { SITE_URL: siteUrl } = await importSiteWith({
      NEXT_PUBLIC_SITE_URL: "https://example.com///",
    });

    expect(siteUrl).toBe("https://example.com");
  });

  it("fails the production build when no url is configured", async () => {
    const imported = importSiteWith({
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
      VERCEL_URL: "",
      NODE_ENV: "production",
    });

    await expect(imported).rejects.toThrow(/生产构建必须提供/);
  });

  it("falls back to the Vercel production domain", async () => {
    const { SITE_URL: siteUrl } = await importSiteWith({
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "aizhida.vercel.app",
      VERCEL_URL: "",
      NODE_ENV: "production",
    });

    expect(siteUrl).toBe("https://aizhida.vercel.app");
  });

  it("rejects plain http in production", async () => {
    const imported = importSiteWith({
      NEXT_PUBLIC_SITE_URL: "http://example.com",
      NODE_ENV: "production",
    });

    await expect(imported).rejects.toThrow(/https/);
  });
});
