import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  categoryLabel,
  FEATURES,
  featureLabel,
  PLATFORMS,
  platformLabel,
  STATUS_VALUES,
  statusLabel,
  TOOL_TYPES,
  typeLabel,
} from "./tool-meta";
import { tools } from "./tools";

// 聚合校验：e2e 覆盖交互，这里保证工具数据与其派生统计保持一致。
describe("dataset invariants", () => {
  it("every category holds at least one tool", () => {
    const seen = new Set(tools.flatMap((tool) => tool.categories));
    for (const category of CATEGORIES) {
      expect(seen.has(category.value)).toBe(true);
    }
  });

  it("every type and platform is exercised by real data", () => {
    const types = new Set(tools.map((tool) => tool.type));
    const platforms = new Set(tools.flatMap((tool) => tool.platforms));
    for (const item of TOOL_TYPES) expect(types.has(item.value)).toBe(true);
    for (const item of PLATFORMS) expect(platforms.has(item.value)).toBe(true);
  });

  it("keeps taglines inside the card budget", () => {
    for (const tool of tools) {
      expect(tool.tagline.length).toBeLessThanOrEqual(60);
      expect(tool.name.length).toBeLessThanOrEqual(30);
    }
  });

  it("keywords are lowercase and short", () => {
    for (const tool of tools) {
      for (const keyword of tool.keywords) {
        expect(keyword).toBe(keyword.toLowerCase());
        expect(keyword.length).toBeLessThanOrEqual(12);
      }
    }
  });

  it("every feature has a label", () => {
    for (const feature of FEATURES) {
      expect(featureLabel(feature.value)).toBe(feature.label);
    }
    for (const tool of tools) {
      for (const feature of tool.features) {
        expect(featureLabel(feature).length).toBeGreaterThan(0);
      }
    }
  });

  it("labels every type and platform", () => {
    for (const tool of tools) {
      expect(typeLabel(tool.type).length).toBeGreaterThan(0);
      for (const platform of tool.platforms) {
        expect(platformLabel(platform).length).toBeGreaterThan(0);
      }
    }
  });

  it("labels every status and falls back for unknown values", () => {
    // TOOL_STATUSES 未导出；经 STATUS_VALUES 枚举合法值。
    for (const status of STATUS_VALUES) {
      expect(statusLabel(status).length).toBeGreaterThan(0);
    }
    for (const tool of tools) {
      expect(statusLabel(tool.status).length).toBeGreaterThan(0);
    }
    // 未知值回退为原样输出，兜底而不是抛错。
    expect(statusLabel("unknown" as never)).toBe("unknown");
    expect(typeLabel("mystery" as never)).toBe("mystery");
    expect(categoryLabel("mystery" as never)).toBe("mystery");
    expect(featureLabel("mystery" as never)).toBe("mystery");
    expect(platformLabel("mystery" as never)).toBe("mystery");
  });
});
