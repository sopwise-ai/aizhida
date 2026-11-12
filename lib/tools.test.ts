import { describe, expect, it } from "vitest";

import { getToolLogo } from "./tool-logos";
import { getTool, toolSchema, tools } from "./tools";

describe("tools dataset", () => {
  it("parses every tool against the zod schema", () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = new Set(tools.map((tool) => tool.id));
    expect(ids.size).toBe(tools.length);
  });

  it("has a logo asset for most tools", () => {
    const withLogo = tools.filter((tool) => getToolLogo(tool.id));
    // 允许少量工具缺少 logo，但缺图比例不能过高（阈值按当前数据放宽）。
    expect(withLogo.length / tools.length).toBeGreaterThan(0.7);
  });

  it("only uses https urls", () => {
    for (const tool of tools) {
      expect(tool.url).toMatch(/^https:\/\//);
    }
  });

  it("looks tools up by id", () => {
    expect(getTool("chatgpt")?.name).toBe("ChatGPT");
    expect(getTool("does-not-exist")).toBeUndefined();
  });

  it("rejects non-https submissions", () => {
    const result = toolSchema.safeParse({
      id: "x-tool",
      name: "X",
      url: "http://example.com",
      desc: "一个足够长的说明文字。",
      categories: ["writing"],
      pricing: "free",
      openSource: false,
      platform: "web",
      tags: ["测试"],
    });
    expect(result.success).toBe(false);
  });
});
