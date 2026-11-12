import { describe, expect, it } from "vitest";

import { tools } from "./tools";

// 聚合校验：e2e 覆盖交互，这里保证工具数据与其派生统计保持一致。
describe("dataset invariants", () => {
  it("every category holds at least one tool", () => {
    const seen = new Set(tools.flatMap((tool) => tool.categories));
    const expected = [
      "writing",
      "image",
      "coding",
      "productivity",
      "video",
      "agent",
    ] as const;
    for (const category of expected) {
      expect(seen.has(category)).toBe(true);
    }
  });

  it("descriptions stay within the display budget", () => {
    for (const tool of tools) {
      expect(tool.desc.length).toBeLessThanOrEqual(60);
      expect(tool.name.length).toBeLessThanOrEqual(30);
    }
  });

  it("tags are lowercase and short", () => {
    for (const tool of tools) {
      for (const tag of tool.tags) {
        expect(tag).toBe(tag.toLowerCase());
        expect(tag.length).toBeLessThanOrEqual(12);
      }
    }
  });
});
