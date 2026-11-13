import { describe, expect, it } from "vitest";
import { PRODUCTION_MISSING_MESSAGE, resolveSiteUrl } from "./site-url";

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
