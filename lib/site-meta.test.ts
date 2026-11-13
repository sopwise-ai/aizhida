import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  DATA_UPDATED_AT,
  DATA_UPDATED_LABEL,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "./site-meta";
import { CATEGORIES } from "./tool-meta";

describe("site metadata", () => {
  it("exposes stable text and links", () => {
    expect(SITE_NAME).toBe("AI 直达");
    expect(SITE_TAGLINE).toBe("只收王牌，一键直达官网");
    expect(REPO_URL).toBe("https://github.com/sopwise-ai/aizhida");
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(80);
    expect(CONTACT_EMAIL).toBeTypeOf("string");
  });

  it("derives the display label from DATA_UPDATED_AT", () => {
    expect(DATA_UPDATED_AT).toMatch(/^\d{4}-\d{2}$/);

    const [year, month] = DATA_UPDATED_AT.split("-");
    expect(DATA_UPDATED_LABEL).toBe(`${year} 年 ${Number(month)} 月`);
  });

  it("keeps the description in sync with the category vocabulary", () => {
    for (const category of CATEGORIES) {
      expect(SITE_DESCRIPTION).toContain(category.label);
    }
  });
});
