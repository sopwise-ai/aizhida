import { describe, expect, it } from "vitest";
import { PRICING_VALUES } from "./meta";
import {
  DEFAULT_FILTERS,
  filterTools,
  isCategory,
  isFeature,
  isPlatform,
  isPricing,
  matchesQuery,
  type ToolFilters,
} from "./search";
import { toolSummaries } from "./tools";

function filtersWith(partial: Partial<ToolFilters>): ToolFilters {
  return { ...DEFAULT_FILTERS, ...partial };
}

describe("filterTools", () => {
  it("returns everything with default filters", () => {
    expect(filterTools(toolSummaries, DEFAULT_FILTERS)).toHaveLength(
      toolSummaries.length,
    );
  });

  it("filters by category", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ categories: ["writing"] }),
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(toolSummaries.length);
    for (const tool of result) {
      expect(tool.categories).toContain("writing");
    }
  });

  it("filters by pricing", () => {
    const result = filterTools(toolSummaries, filtersWith({ pricing: "free" }));
    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(tool.pricing).toBe("free");
    }
  });

  it("filters by open source", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ openSource: "yes" }),
    );
    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(tool.openSource).toBe(true);
    }
  });

  it("combines different dimensions with AND", () => {
    const writing = filterTools(
      toolSummaries,
      filtersWith({ categories: ["writing"] }),
    );
    const both = filterTools(
      toolSummaries,
      filtersWith({ categories: ["writing"], pricing: "free" }),
    );
    expect(both.length).toBeLessThanOrEqual(writing.length);
    for (const tool of both) {
      expect(tool.pricing).toBe("free");
    }
  });

  it("combines same-dimension categories with OR", () => {
    const writing = filterTools(
      toolSummaries,
      filtersWith({ categories: ["writing"] }),
    );
    const image = filterTools(
      toolSummaries,
      filtersWith({ categories: ["image"] }),
    );
    const either = filterTools(
      toolSummaries,
      filtersWith({ categories: ["writing", "image"] }),
    );
    // 无查询时同维度取并集（一个工具可同时属于多个分类）。
    const expected = new Set([...writing, ...image].map((tool) => tool.id))
      .size;
    expect(either.length).toBe(expected);
  });
});

describe("matchesQuery", () => {
  it("matches everything for empty query", () => {
    for (const tool of toolSummaries) {
      expect(matchesQuery(tool, "")).toBe(true);
      expect(matchesQuery(tool, "   ")).toBe(true);
    }
  });

  it("finds toolSummaries by exact name", () => {
    const chatgpt = toolSummaries.find((tool) => tool.id === "chatgpt");
    if (!chatgpt) throw new Error("chatgpt missing");
    expect(matchesQuery(chatgpt, "ChatGPT")).toBe(true);
  });

  it("treats 免费 as the free tier, not any label containing 免费", () => {
    const free = toolSummaries.filter((tool) => matchesQuery(tool, "免费"));
    const freeTier = toolSummaries.filter((tool) => tool.pricing === "free");
    expect(free).toEqual(freeTier);
  });

  it("expands synonyms so 聊天 finds chat toolSummaries", () => {
    const chat = toolSummaries.filter((tool) => matchesQuery(tool, "聊天"));
    expect(chat.length).toBeGreaterThan(0);
    expect(chat.some((tool) => tool.id === "chatgpt")).toBe(true);
  });

  it("rejects non-matching queries", () => {
    const first = toolSummaries[0];
    if (!first) throw new Error("dataset empty");
    expect(matchesQuery(first, "不存在的工具名xyzzy")).toBe(false);
  });

  it("matches by hostname", () => {
    const cursor = toolSummaries.find((tool) => tool.id === "cursor");
    if (!cursor) throw new Error("cursor missing");
    expect(matchesQuery(cursor, "cursor.com")).toBe(true);
  });
});

describe("search quality", () => {
  it("does not widen a proper noun into its alias group", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ query: "chatgpt" }),
    );

    // 修复前 "chatgpt" 命中 27 条（因为包含 "chat" 被扩成整组同义词）。
    expect(result[0]?.id).toBe("chatgpt");
    expect(result.length).toBeLessThan(5);
  });

  it("ranks an exact name match first", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ query: "ChatGPT" }),
    );
    expect(result[0]?.id).toBe("chatgpt");
  });

  it("matches tool ids so URL slugs are searchable", () => {
    const claudeCode = toolSummaries.find((tool) => tool.id === "claude-code");
    if (!claudeCode) throw new Error("claude-code missing");

    expect(matchesQuery(claudeCode, "claude-code")).toBe(true);
    expect(
      filterTools(toolSummaries, filtersWith({ query: "claude-code" })),
    ).toContainEqual(claudeCode);
  });

  it("matches the pricing slug as well as its label", () => {
    const chatgpt = toolSummaries.find((tool) => tool.id === "chatgpt");
    if (!chatgpt) throw new Error("chatgpt missing");

    expect(chatgpt.pricing).toBe("freemium");
    expect(matchesQuery(chatgpt, "freemium")).toBe(true);
  });

  it("keeps dataset order when there is no query", () => {
    const result = filterTools(toolSummaries, DEFAULT_FILTERS);
    expect(result.map((tool) => tool.id)).toEqual(
      toolSummaries.map((tool) => tool.id),
    );
  });
});

describe("guards", () => {
  it("validates category values", () => {
    expect(isCategory("writing")).toBe(true);
    expect(isCategory("nope")).toBe(false);
    expect(isCategory(null)).toBe(false);
  });

  it("validates pricing values against the vocabulary", () => {
    for (const value of PRICING_VALUES) {
      expect(isPricing(value)).toBe(true);
    }
    expect(isPricing("forever")).toBe(false);
    expect(isPricing(null)).toBe(false);
  });

  it("validates platform values", () => {
    expect(isPlatform("web")).toBe(true);
    expect(isPlatform("teleport")).toBe(false);
    expect(isPlatform(null)).toBe(false);
  });

  it("validates feature values", () => {
    expect(isFeature("multimodal")).toBe(true);
    expect(isFeature("telepathy")).toBe(false);
    expect(isFeature(null)).toBe(false);
  });
});

describe("filterTools dimensions", () => {
  it("filters by platform with OR semantics", () => {
    const web = filterTools(toolSummaries, filtersWith({ platforms: ["web"] }));
    const desktop = filterTools(
      toolSummaries,
      filtersWith({ platforms: ["desktop"] }),
    );
    const both = filterTools(
      toolSummaries,
      filtersWith({ platforms: ["web", "desktop"] }),
    );
    expect(web.length).toBeGreaterThan(0);
    expect(desktop.length).toBeGreaterThan(0);
    expect(both.length).toBeGreaterThanOrEqual(web.length);
    expect(both.length).toBeLessThanOrEqual(web.length + desktop.length);
    for (const tool of both) {
      expect(
        tool.platforms.includes("web") || tool.platforms.includes("desktop"),
      ).toBe(true);
    }
  });

  it("filters by feature with OR semantics", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ features: ["multimodal", "long-context"] }),
    );
    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(
        tool.features.includes("multimodal") ||
          tool.features.includes("long-context"),
      ).toBe(true);
    }
  });

  it("combines platform, pricing and feature filters with AND", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({
        platforms: ["web"],
        pricing: "free",
        features: ["multimodal"],
      }),
    );
    for (const tool of result) {
      expect(tool.platforms).toContain("web");
      expect(tool.pricing).toBe("free");
      expect(tool.features).toContain("multimodal");
    }
  });

  it("requires every whitespace-separated term to match", () => {
    const openIds = new Set(
      filterTools(toolSummaries, filtersWith({ query: "开源" })).map(
        (tool) => tool.id,
      ),
    );
    const codeIds = new Set(
      filterTools(toolSummaries, filtersWith({ query: "代码" })).map(
        (tool) => tool.id,
      ),
    );
    const intersection = new Set([...openIds].filter((id) => codeIds.has(id)));

    const result = filterTools(
      toolSummaries,
      filtersWith({ query: "开源 代码" }),
    );

    expect(result.length).toBeGreaterThan(0);
    expect(new Set(result.map((tool) => tool.id))).toEqual(intersection);
  });

  it("combines a query with dimension filters using AND", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ query: "chat", categories: ["writing"] }),
    );

    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(tool.categories).toContain("writing");
      expect(matchesQuery(tool, "chat")).toBe(true);
    }
  });

  it("ignores trailing punctuation in queries", () => {
    const result = filterTools(
      toolSummaries,
      filtersWith({ query: "ChatGPT？" }),
    );
    expect(result[0]?.id).toBe("chatgpt");

    expect(
      filterTools(toolSummaries, filtersWith({ query: "？" })),
    ).toHaveLength(toolSummaries.length);
  });
});
