import { describe, expect, it } from "vitest";

import {
  CONTACT_EMAIL,
  DATA_UPDATED_AT,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "./site";

describe("site config", () => {
  it("exposes stable site metadata", () => {
    expect(SITE_NAME).toBe("AI 直达");
    expect(SITE_TAGLINE).toBe("只收王牌，一键直达官网");
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(10);
    expect(REPO_URL).toMatch(/^https:\/\/github\.com\//);
    expect(DATA_UPDATED_AT).toMatch(/^\d{4}-\d{2}$/);
  });

  it("normalizes the site URL", () => {
    expect(SITE_URL).not.toMatch(/\/+$/);
    expect(() => new URL(SITE_URL)).not.toThrow();
  });
});

describe("env", () => {
  it("keeps optional values optional", () => {
    expect(CONTACT_EMAIL).toBeDefined();
  });
});
