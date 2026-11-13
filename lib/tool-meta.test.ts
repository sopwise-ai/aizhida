import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  categoryLabel,
  FEATURE_GROUPS,
  FEATURES,
  featureLabel,
  PLATFORMS,
  PRICING_OPTIONS,
  platformLabel,
  pricingLabel,
  STATUS_VALUES,
  statusLabel,
  TOOL_TYPES,
  typeLabel,
} from "./tool-meta";
import { tools } from "./tools";

// 聚合校验：e2e 覆盖交互，这里保证工具数据与其派生统计保持一致。
describe("dataset invariants", () => {
  it("keeps every vocabulary value, label and group unique", () => {
    const vocabularies = [
      { name: "categories", items: CATEGORIES },
      { name: "types", items: TOOL_TYPES },
      { name: "platforms", items: PLATFORMS },
      { name: "pricing", items: PRICING_OPTIONS },
      { name: "feature groups", items: FEATURE_GROUPS },
      { name: "features", items: FEATURES },
    ];

    for (const { name, items } of vocabularies) {
      const values = items.map((item) => item.value);
      const labels = items.map((item) => item.label);

      expect(new Set(values).size, `${name} values`).toBe(values.length);
      expect(new Set(labels).size, `${name} labels`).toBe(labels.length);
    }

    const statusLabels = STATUS_VALUES.map((status) => statusLabel(status));
    expect(new Set(statusLabels).size).toBe(statusLabels.length);
  });

  it("assigns every feature to a declared, non-empty group", () => {
    const groups = new Set(FEATURE_GROUPS.map((group) => group.value));

    for (const feature of FEATURES) {
      expect(groups.has(feature.group)).toBe(true);
    }

    for (const group of FEATURE_GROUPS) {
      expect(FEATURES.some((feature) => feature.group === group.value)).toBe(
        true,
      );
    }
  });

  it("keeps every feature group represented in real data", () => {
    const used = new Set(tools.flatMap((tool) => tool.features));

    for (const group of FEATURE_GROUPS) {
      const inGroup = FEATURES.filter(
        (feature) => feature.group === group.value,
      );
      expect(inGroup.some((feature) => used.has(feature.value))).toBe(true);
    }
  });

  it("describes every category for its landing page", () => {
    for (const category of CATEGORIES) {
      expect(category.description.length).toBeGreaterThan(20);
    }
  });

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
    expect(pricingLabel("mystery" as never)).toBe("mystery");
  });
});
