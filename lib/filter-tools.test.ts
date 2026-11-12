import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  filterTools,
  isCategory,
  isPlatform,
  isPricing,
  matchesQuery,
  type ToolFilters,
} from "./filter-tools";
import { tools } from "./tools";

function filtersWith(partial: Partial<ToolFilters>): ToolFilters {
  return { ...DEFAULT_FILTERS, ...partial };
}

describe("filterTools", () => {
  it("returns everything with default filters", () => {
    expect(filterTools(tools, DEFAULT_FILTERS)).toHaveLength(tools.length);
  });

  it("filters by category", () => {
    const result = filterTools(tools, filtersWith({ categories: ["writing"] }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(tools.length);
    for (const tool of result) {
      expect(tool.categories).toContain("writing");
    }
  });

  it("filters by pricing", () => {
    const result = filterTools(tools, filtersWith({ pricing: "free" }));
    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(tool.pricing).toBe("free");
    }
  });

  it("filters by open source", () => {
    const result = filterTools(tools, filtersWith({ openSource: "yes" }));
    expect(result.length).toBeGreaterThan(0);
    for (const tool of result) {
      expect(tool.openSource).toBe(true);
    }
  });

  it("combines different dimensions with AND", () => {
    const writing = filterTools(
      tools,
      filtersWith({ categories: ["writing"] }),
    );
    const both = filterTools(
      tools,
      filtersWith({ categories: ["writing"], pricing: "free" }),
    );
    expect(both.length).toBeLessThanOrEqual(writing.length);
    for (const tool of both) {
      expect(tool.pricing).toBe("free");
    }
  });

  it("combines same-dimension categories with OR", () => {
    const writing = filterTools(
      tools,
      filtersWith({ categories: ["writing"] }),
    );
    const image = filterTools(tools, filtersWith({ categories: ["image"] }));
    const either = filterTools(
      tools,
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
    for (const tool of tools) {
      expect(matchesQuery(tool, "")).toBe(true);
      expect(matchesQuery(tool, "   ")).toBe(true);
    }
  });

  it("finds tools by exact name", () => {
    const chatgpt = tools.find((tool) => tool.id === "chatgpt");
    if (!chatgpt) throw new Error("chatgpt missing");
    expect(matchesQuery(chatgpt, "ChatGPT")).toBe(true);
  });

  it("treats 免费 as the free tier, not any label containing 免费", () => {
    const free = tools.filter((tool) => matchesQuery(tool, "免费"));
    const freeTier = tools.filter((tool) => tool.pricing === "free");
    expect(free).toEqual(freeTier);
  });

  it("expands synonyms so 聊天 finds chat tools", () => {
    const chat = tools.filter((tool) => matchesQuery(tool, "聊天"));
    expect(chat.length).toBeGreaterThan(0);
    expect(chat.some((tool) => tool.id === "chatgpt")).toBe(true);
  });

  it("rejects non-matching queries", () => {
    const first = tools[0];
    if (!first) throw new Error("dataset empty");
    expect(matchesQuery(first, "不存在的工具名xyzzy")).toBe(false);
  });

  it("matches by hostname", () => {
    const cursor = tools.find((tool) => tool.id === "cursor");
    if (!cursor) throw new Error("cursor missing");
    expect(matchesQuery(cursor, "cursor.com")).toBe(true);
  });
});

describe("guards", () => {
  it("validates category values", () => {
    expect(isCategory("writing")).toBe(true);
    expect(isCategory("nope")).toBe(false);
    expect(isCategory(null)).toBe(false);
  });

  it("validates pricing values", () => {
    expect(isPricing("free")).toBe(true);
    expect(isPricing("forever")).toBe(false);
    expect(isPricing(null)).toBe(false);
  });

  it("validates platform values", () => {
    expect(isPlatform("web")).toBe(true);
    expect(isPlatform("teleport")).toBe(false);
    expect(isPlatform(null)).toBe(false);
  });
});
