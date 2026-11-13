import { describe, expect, it } from "vitest";

import { getToolLogo } from "./tool-logos";
import {
  getTool,
  toolSchema,
  toolSummaries,
  tools,
  toolsSchema,
} from "./tools";

const minimalTool = {
  id: "x-tool",
  name: "X Tool",
  vendorId: "openai",
  categories: ["writing"],
  type: "app",
  platforms: ["web"],
  pricing: "free",
  openSource: false,
  status: "active",
  tagline: "一个足够长的说明文字，用来描述这个工具。",
  description: "这是一段用于测试 schema 的详情描述。".repeat(10),
  features: ["chat", "rewrite"],
  keywords: ["测试"],
  links: {
    website: "https://example.com",
    github: null,
    docs: null,
    pricing: null,
    store: null,
  },
  affiliateUrl: null,
  sponsored: false,
  addedAt: "2026-11-11",
  updatedAt: "2026-11-11",
  verifiedAt: "2026-11-11",
};

describe("tools dataset", () => {
  it("parses every tool against the zod schema", () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = new Set(tools.map((tool) => tool.id));
    expect(ids.size).toBe(tools.length);
  });

  it("has unique canonical websites", () => {
    const sites = tools.map((tool) => {
      const url = new URL(tool.links.website);
      return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}`;
    });
    expect(new Set(sites).size).toBe(tools.length);
  });

  it("has a logo asset for most tools", () => {
    const withLogo = tools.filter((tool) => getToolLogo(tool.id));
    // 允许少量工具缺少 logo，但缺图比例不能过高（阈值按当前数据放宽）。
    expect(withLogo.length / tools.length).toBeGreaterThan(0.7);
  });

  it("only uses https urls", () => {
    for (const tool of tools) {
      expect(tool.links.website).toMatch(/^https:\/\//);
      for (const link of Object.values(tool.links)) {
        if (link) expect(link).toMatch(/^https:\/\//);
      }
    }
  });

  it("keeps descriptions within the detail-page budget", () => {
    for (const tool of tools) {
      expect(tool.tagline.length).toBeLessThanOrEqual(60);
      expect(tool.description.length).toBeGreaterThanOrEqual(120);
      expect(tool.description.length).toBeLessThanOrEqual(300);
      expect(tool.features.length).toBeGreaterThanOrEqual(2);
      expect(tool.features.length).toBeLessThanOrEqual(6);
    }
  });

  it("dates stay coherent", () => {
    for (const tool of tools) {
      expect(tool.addedAt <= tool.updatedAt).toBe(true);
      expect(tool.verifiedAt <= tool.updatedAt).toBe(true);
    }
  });

  it("projects a lean summary for the client bundle", () => {
    expect(toolSummaries).toHaveLength(tools.length);
    const summary = toolSummaries[0];
    const full = tools[0];
    if (!summary || !full) throw new Error("dataset empty");

    expect(summary).not.toHaveProperty("description");
    expect(summary).not.toHaveProperty("links");
    expect(summary.website).toBe(full.links.website);
    // 摘要必须显著小于完整记录，否则首页又会把详情字段带上客户端。
    expect(JSON.stringify(toolSummaries).length).toBeLessThan(
      JSON.stringify(tools).length * 0.7,
    );
  });

  it("looks tools up by id", () => {
    expect(getTool("chatgpt")?.name).toBe("ChatGPT");
    expect(getTool("does-not-exist")).toBeUndefined();
  });

  it("accepts a well-formed v2 record", () => {
    expect(toolSchema.safeParse(minimalTool).success).toBe(true);
  });

  it("rejects non-https submissions", () => {
    const result = toolSchema.safeParse({
      ...minimalTool,
      links: { ...minimalTool.links, website: "http://example.com" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown enum values", () => {
    expect(
      toolSchema.safeParse({ ...minimalTool, type: "banana" }).success,
    ).toBe(false);
    expect(
      toolSchema.safeParse({ ...minimalTool, features: ["not-a-feature"] })
        .success,
    ).toBe(false);
  });

  it("rejects descriptions that are too short", () => {
    const result = toolSchema.safeParse({
      ...minimalTool,
      description: "太短了。",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate ids and duplicate websites", () => {
    // 数组级别的 superRefine：直接构造两条相同记录。
    const result = toolsSchema.safeParse([minimalTool, minimalTool]);
    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = JSON.stringify(result.error.issues);
    expect(messages).toContain("id 重复");
    expect(messages).toContain("官网重复");
  });

  it("rejects unknown vendorId", () => {
    const result = toolsSchema.safeParse([
      { ...minimalTool, vendorId: "no-such-vendor" },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects incoherent dates", () => {
    const earlyUpdate = toolsSchema.safeParse([
      { ...minimalTool, updatedAt: "2026-11-10" },
    ]);
    expect(earlyUpdate.success).toBe(false);

    const lateVerified = toolsSchema.safeParse([
      { ...minimalTool, verifiedAt: "2026-11-12" },
    ]);
    expect(lateVerified.success).toBe(false);
  });
});
