import { afterEach, describe, expect, it, vi } from "vitest";

import { PRODUCTION_MISSING_MESSAGE, resolveSiteUrl, SITE_URL } from "./url";

const dev = { isProduction: false } as const;
const prod = { isProduction: true } as const;

describe("resolveSiteUrl", () => {
  it("uses the configured url and strips trailing slashes", () => {
    expect(resolveSiteUrl({ ...dev, siteUrl: "https://example.com///" })).toBe(
      "https://example.com",
    );
  });

  it("drops query/hash but keeps a base path", () => {
    expect(
      resolveSiteUrl({
        ...dev,
        siteUrl: "https://example.com/base/?from=ad#top",
      }),
    ).toBe("https://example.com/base");
  });

  it("prefers the explicit url over the Vercel domain", () => {
    expect(
      resolveSiteUrl({
        ...prod,
        siteUrl: "https://aizhida.com",
        vercelUrl: "aizhida.vercel.app",
      }),
    ).toBe("https://aizhida.com");
  });

  it("falls back to the Vercel domain over https", () => {
    expect(resolveSiteUrl({ ...prod, vercelUrl: "aizhida.vercel.app" })).toBe(
      "https://aizhida.vercel.app",
    );
  });

  it("tolerates a Vercel value that accidentally includes a scheme", () => {
    expect(
      resolveSiteUrl({ ...prod, vercelUrl: "https://aizhida.vercel.app/" }),
    ).toBe("https://aizhida.vercel.app");
  });

  it("defaults to localhost in development and honors the port", () => {
    expect(resolveSiteUrl({ ...dev })).toBe("http://localhost:3000");
    expect(resolveSiteUrl({ ...dev, port: "4321" })).toBe(
      "http://localhost:4321",
    );
  });

  it("allows http and loopback outside production", () => {
    expect(resolveSiteUrl({ ...dev, siteUrl: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
  });

  it("throws a helpful error when production has no url at all", () => {
    expect(() => resolveSiteUrl({ ...prod })).toThrow(
      PRODUCTION_MISSING_MESSAGE,
    );
  });

  it("requires https in production", () => {
    expect(() =>
      resolveSiteUrl({ ...prod, siteUrl: "http://example.com" }),
    ).toThrow(/必须使用 https/);
  });

  it.each([
    "https://localhost",
    "https://localhost.",
    "https://app.localhost",
    "https://0.0.0.0",
    "https://127.0.0.1",
    "https://127.1.2.3",
    "https://[::1]",
  ])("rejects the local address %s in production", (siteUrl) => {
    expect(() => resolveSiteUrl({ ...prod, siteUrl })).toThrow(/本地地址/);
  });

  it("rejects protocols other than http(s)", () => {
    expect(() =>
      resolveSiteUrl({ ...dev, siteUrl: "ftp://example.com" }),
    ).toThrow(/http\(s\)/);
    expect(() =>
      resolveSiteUrl({ ...dev, siteUrl: "mailto:hi@example.com" }),
    ).toThrow(/http\(s\)/);
  });

  it("rejects credentials embedded in the url", () => {
    expect(() =>
      resolveSiteUrl({ ...dev, siteUrl: "https://user:pass@example.com" }),
    ).toThrow(/用户名或密码/);
  });

  it("names the offending variable when the value is not absolute", () => {
    expect(() => resolveSiteUrl({ ...dev, siteUrl: "example.com" })).toThrow(
      /NEXT_PUBLIC_SITE_URL 不是合法的绝对地址/,
    );
    expect(() => resolveSiteUrl({ ...dev, vercelUrl: "not a host" })).toThrow(
      /VERCEL_URL 不是合法的绝对地址/,
    );
  });
});

/**
 * 这些用例通过 vi.stubEnv + resetModules 重新求值 lib/url.ts，
 * 覆盖「构建期失败」这一唯一但关键的行为。
 */
async function importSiteWith(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  return import("./url");
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
