import { describe, expect, it } from "vitest";
import { toToolSummary } from "./tool-summary";
import { getTool } from "./tools";

const EXPECTED_KEYS = [
  "categories",
  "features",
  "id",
  "keywords",
  "logo",
  "name",
  "openSource",
  "platforms",
  "pricing",
  "status",
  "tagline",
  "type",
  "vendorId",
  "website",
];

describe("toToolSummary", () => {
  const tool = getTool("chatgpt");
  if (!tool) throw new Error("fixture missing: chatgpt");

  it("projects exactly the client fields and nothing else", () => {
    const summary = toToolSummary(tool, "/logos/chatgpt.png");

    expect(Object.keys(summary).sort()).toEqual(EXPECTED_KEYS);
    // 详情/运营字段绝不能出现在客户端摘要里。
    expect(summary).not.toHaveProperty("description");
    expect(summary).not.toHaveProperty("links");
    expect(summary).not.toHaveProperty("affiliateUrl");
    expect(summary).not.toHaveProperty("sponsored");
    expect(summary).not.toHaveProperty("addedAt");
    expect(summary).not.toHaveProperty("updatedAt");
    expect(summary).not.toHaveProperty("verifiedAt");
  });

  it("flattens the website and keeps the logo argument", () => {
    const summary = toToolSummary(tool, "/logos/chatgpt.png");

    expect(summary.website).toBe(tool.links.website);
    expect(summary.logo).toBe("/logos/chatgpt.png");
  });

  it("defaults the logo to null", () => {
    expect(toToolSummary(tool).logo).toBeNull();
  });

  it("keeps the filterable fields intact", () => {
    const summary = toToolSummary(tool, null);

    expect(summary.id).toBe(tool.id);
    expect(summary.categories).toEqual(tool.categories);
    expect(summary.platforms).toEqual(tool.platforms);
    expect(summary.features).toEqual(tool.features);
    expect(summary.keywords).toEqual(tool.keywords);
    expect(summary.pricing).toBe(tool.pricing);
    expect(summary.openSource).toBe(tool.openSource);
  });
});
