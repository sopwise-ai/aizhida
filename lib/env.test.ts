import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * env.ts 是模块级求值：重新导入前先 resetModules + stubEnv。
 * 失败用例里 t3-env 会先 console.error 详细 issue 再抛通用错误，
 * 所以既断言抛错，也断言日志能指到具体变量。
 */
async function importEnv(vars: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(vars)) {
    vi.stubEnv(key, value);
  }
  return import("./env");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("env", () => {
  it("accepts http(s) urls and emails", async () => {
    const { env } = await importEnv({
      NEXT_PUBLIC_SITE_URL: "https://example.com",
      NEXT_PUBLIC_CONTACT_EMAIL: "hi@example.com",
    });

    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
    expect(env.NEXT_PUBLIC_CONTACT_EMAIL).toBe("hi@example.com");
  });

  it("allows http outside production (https is enforced by site-url)", async () => {
    const { env } = await importEnv({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("treats empty strings as unset", async () => {
    const { env } = await importEnv({
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_CONTACT_EMAIL: "",
    });

    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(env.NEXT_PUBLIC_CONTACT_EMAIL).toBeUndefined();
  });

  it("rejects urls whose scheme is not http(s)", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      importEnv({ NEXT_PUBLIC_SITE_URL: "ftp://example.com" }),
    ).rejects.toThrow(/Invalid environment variables/);

    expect(JSON.stringify(logged.mock.calls)).toContain("NEXT_PUBLIC_SITE_URL");
  });

  it("rejects malformed emails", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      importEnv({ NEXT_PUBLIC_CONTACT_EMAIL: "not-an-email" }),
    ).rejects.toThrow(/Invalid environment variables/);

    expect(JSON.stringify(logged.mock.calls)).toContain(
      "NEXT_PUBLIC_CONTACT_EMAIL",
    );
  });
});
