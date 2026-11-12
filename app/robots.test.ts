import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/site";
import robots from "./robots";

describe("robots", () => {
  it("allows all agents and points at the sitemap", () => {
    const data = robots();
    expect(data.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(data.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(data.host).toBe(new URL(SITE_URL).host);
  });
});
