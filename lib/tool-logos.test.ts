import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getToolLogo } from "./tool-logos";
import logoExtensions from "./tool-logos.json";
import { tools } from "./tools";

const logoDir = join(process.cwd(), "public", "logos");
const logoFiles = readdirSync(logoDir);

/**
 * 映射表和 public/logos 是一对必须同步维护的数据：漏登记 → 没图；
 * 登记了但文件不在 → 线上 404 破图；文件在但没登记 → 死资产。
 * 这些都属于"构建能过、线上才炸"的问题，放进测试守住。
 */
describe("tool logos", () => {
  it("only maps real tools with slug ids and supported extensions", () => {
    const toolIds = new Set(tools.map((tool) => tool.id));

    for (const [id, extension] of Object.entries(logoExtensions)) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(toolIds.has(id)).toBe(true);
      expect(["svg", "png"]).toContain(extension);
    }
  });

  it("has the declared file for every mapping entry", () => {
    for (const [id, extension] of Object.entries(logoExtensions)) {
      expect(logoFiles).toContain(`${id}.${extension}`);
    }
  });

  it("does not ship unlisted or unsupported asset files", () => {
    const mapped = new Set(
      Object.entries(logoExtensions).map(
        ([id, extension]) => `${id}.${extension}`,
      ),
    );

    for (const file of logoFiles) {
      expect(file).toMatch(/\.(svg|png)$/);
      expect(mapped.has(file)).toBe(true);
    }
  });

  it("builds public paths and returns undefined for unknown ids", () => {
    expect(getToolLogo("cursor")).toBe("/logos/cursor.svg");
    expect(getToolLogo("notion")).toBe("/logos/notion.png");
    expect(getToolLogo("unknown-tool")).toBeUndefined();
  });

  it("does not fall through to prototype keys", () => {
    expect(getToolLogo("constructor")).toBeUndefined();
    expect(getToolLogo("__proto__")).toBeUndefined();
    expect(getToolLogo("toString")).toBeUndefined();
  });
});
