import { describe, expect, it } from "vitest";
import { getToolLogo } from "./tool-logos";
import { FIELD_LIMITS } from "./tool-meta";
import {
  canonicalSiteKey,
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
    const sites = tools.map((tool) => canonicalSiteKey(tool.links.website));
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

  it("keeps every record inside the shared field budgets", () => {
    for (const tool of tools) {
      expect(tool.tagline.length).toBeLessThanOrEqual(
        FIELD_LIMITS.taglineMaxLength,
      );
      expect(tool.description.length).toBeGreaterThanOrEqual(
        FIELD_LIMITS.descriptionMinLength,
      );
      expect(tool.description.length).toBeLessThanOrEqual(
        FIELD_LIMITS.descriptionMaxLength,
      );
      expect(tool.features.length).toBeGreaterThanOrEqual(
        FIELD_LIMITS.featuresMin,
      );
      expect(tool.features.length).toBeLessThanOrEqual(
        FIELD_LIMITS.featuresMax,
      );
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
    // 摘要必须显著小于完整记录（实测约 0.53），否则详情字段又回客户端了。
    expect(JSON.stringify(toolSummaries).length).toBeLessThan(
      JSON.stringify(tools).length * 0.6,
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

  it("rejects unknown fields instead of silently stripping them", () => {
    expect(
      toolSchema.safeParse({ ...minimalTool, platfroms: ["web"] }).success,
    ).toBe(false);

    expect(
      toolSchema.safeParse({
        ...minimalTool,
        links: { ...minimalTool.links, gihub: "https://example.com" },
      }).success,
    ).toBe(false);
  });

  it("bounds taglines, keywords and taxonomy arrays", () => {
    const cases = [
      { name: " ChatGPT" },
      { tagline: "太短" },
      { tagline: " 一段足够长的说明文字 " },
      { tagline: "长".repeat(61) },
      { keywords: ["GPT"] },
      { keywords: [" gpt"] },
      { keywords: ["gpt "] },
      { keywords: ["a".repeat(21)] },
      { categories: ["assistant", "writing", "image", "coding"] },
      { categories: ["writing", "writing"] },
      { features: ["chat"] },
      {
        features: [
          "chat",
          "rewrite",
          "summarize",
          "translation",
          "multimodal",
          "long-context",
          "file-upload",
          "web-search",
          "code-execution",
        ],
      },
      { features: ["chat", "chat"] },
      { platforms: ["web", "web"] },
    ];

    for (const patch of cases) {
      expect(toolSchema.safeParse({ ...minimalTool, ...patch }).success).toBe(
        false,
      );
    }
  });

  it("caps slug lengths so ids stay URL-friendly", () => {
    expect(
      toolSchema.safeParse({ ...minimalTool, id: "a".repeat(61) }).success,
    ).toBe(false);
    expect(
      toolSchema.safeParse({ ...minimalTool, vendorId: "a".repeat(61) })
        .success,
    ).toBe(false);
  });

  it("rejects calendar-invalid dates", () => {
    expect(
      toolSchema.safeParse({ ...minimalTool, addedAt: "2026-02-30" }).success,
    ).toBe(false);
    expect(
      toolSchema.safeParse({ ...minimalTool, addedAt: "2026-13-01" }).success,
    ).toBe(false);
  });

  it("allows up to eight features for the expanded vocabulary", () => {
    const result = toolSchema.safeParse({
      ...minimalTool,
      features: [
        "chat",
        "rewrite",
        "summarize",
        "translation",
        "multimodal",
        "long-context",
        "file-upload",
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects oversized urls and urls with credentials", () => {
    const longUrl = `https://example.com/${"a".repeat(2048)}`;
    expect(
      toolSchema.safeParse({
        ...minimalTool,
        links: { ...minimalTool.links, website: longUrl },
      }).success,
    ).toBe(false);

    expect(
      toolSchema.safeParse({
        ...minimalTool,
        links: {
          ...minimalTool.links,
          website: "https://user:pass@example.com",
        },
      }).success,
    ).toBe(false);
  });

  it("accepts real leap days and rejects impossible ones", () => {
    expect(
      toolSchema.safeParse({ ...minimalTool, addedAt: "2024-02-29" }).success,
    ).toBe(true);
    expect(
      toolSchema.safeParse({ ...minimalTool, addedAt: "2023-02-29" }).success,
    ).toBe(false);
  });

  it("rejects malformed urls without throwing from safeParse", () => {
    const parse = () =>
      toolSchema.safeParse({
        ...minimalTool,
        links: { ...minimalTool.links, website: "not a url" },
      });

    expect(parse).not.toThrow();
    expect(parse().success).toBe(false);
  });

  it("uses the shared description budget at both boundaries", () => {
    const atFloor = "字".repeat(FIELD_LIMITS.descriptionMinLength);
    const atCeiling = "字".repeat(FIELD_LIMITS.descriptionMaxLength);

    expect(
      toolSchema.safeParse({ ...minimalTool, description: atFloor }).success,
    ).toBe(true);
    expect(
      toolSchema.safeParse({ ...minimalTool, description: atFloor.slice(1) })
        .success,
    ).toBe(false);
    expect(
      toolSchema.safeParse({ ...minimalTool, description: atCeiling }).success,
    ).toBe(true);
    expect(
      toolSchema.safeParse({
        ...minimalTool,
        description: `${atCeiling}字`,
      }).success,
    ).toBe(false);
  });

  it("accepts keywords up to the shared per-keyword limit", () => {
    expect(
      toolSchema.safeParse({
        ...minimalTool,
        keywords: ["a".repeat(FIELD_LIMITS.keywordMaxLength)],
      }).success,
    ).toBe(true);
    expect(
      toolSchema.safeParse({
        ...minimalTool,
        keywords: ["a".repeat(FIELD_LIMITS.keywordMaxLength + 1)],
      }).success,
    ).toBe(false);
  });

  it("canonicalizes www, trailing slashes and query but keeps ports", () => {
    expect(canonicalSiteKey("https://www.example.com/")).toBe("example.com");
    expect(canonicalSiteKey("https://example.com")).toBe("example.com");
    expect(canonicalSiteKey("https://example.com/?ref=x#top")).toBe(
      "example.com",
    );
    expect(canonicalSiteKey("https://example.com:8443/a/")).toBe(
      "example.com:8443/a",
    );
  });

  it("treats www and trailing-slash variants as the same website", () => {
    const result = toolsSchema.safeParse([
      minimalTool,
      {
        ...minimalTool,
        id: "x-tool-2",
        links: { ...minimalTool.links, website: "https://www.example.com/" },
      },
    ]);

    expect(result.success).toBe(false);
  });

  it("treats the same host on a different port as a different website", () => {
    const result = toolsSchema.safeParse([
      minimalTool,
      {
        ...minimalTool,
        id: "x-tool-2",
        links: {
          ...minimalTool.links,
          website: "https://example.com:8443",
        },
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("rejects malformed websites without throwing from safeParse", () => {
    const parse = () =>
      toolsSchema.safeParse([
        {
          ...minimalTool,
          links: { ...minimalTool.links, website: "not a url" },
        },
      ]);

    expect(parse).not.toThrow();
    expect(parse().success).toBe(false);
  });
});
