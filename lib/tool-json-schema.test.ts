import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import rawTools from "@/data/tools.json";
import { toolsJsonSchemaText } from "./tool-json-schema";
import {
  CATEGORY_VALUES,
  FEATURE_VALUES,
  FIELD_LIMITS,
  PLATFORM_VALUES,
  PRICING_VALUES,
  STATUS_VALUES,
  TYPE_VALUES,
} from "./tool-meta";

const committedPath = resolve(process.cwd(), "data/schema/tools.schema.json");

function readCommitted(): string {
  return readFileSync(committedPath, "utf8");
}

/**
 * JSON Schema 是生成物。这里比对「已提交文件」与「按当前 zod schema
 * 重新生成的结果」，两者不一致就让 CI 失败——防止有人改了 toolSchema
 * 却忘了跑 `pnpm schema:generate`，让编辑器提示悄悄过期。
 */
describe("data/schema/tools.schema.json", () => {
  it("stays in sync with lib/tool-schema.ts", () => {
    // 比对解析后的结构而不是原始文本：格式化差异不该让测试失败，
    // 字段或取值的漂移才该。
    expect(JSON.parse(readCommitted())).toEqual(
      JSON.parse(toolsJsonSchemaText),
    );
  });

  it("describes the whole file as a non-empty array", () => {
    const schema = JSON.parse(readCommitted());
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.type).toBe("array");
    expect(schema.minItems).toBe(1);
    expect(schema.items.type).toBe("object");
    expect(schema.items.additionalProperties).toBe(false);
  });

  it("carries every controlled vocabulary from lib/tool-meta.ts", () => {
    const { properties } = JSON.parse(readCommitted()).items;

    expect(properties.categories.items.enum).toEqual([...CATEGORY_VALUES]);
    expect(properties.type.enum).toEqual([...TYPE_VALUES]);
    expect(properties.platforms.items.enum).toEqual([...PLATFORM_VALUES]);
    expect(properties.pricing.enum).toEqual([...PRICING_VALUES]);
    expect(properties.status.enum).toEqual([...STATUS_VALUES]);
    expect(properties.features.items.enum).toEqual([...FEATURE_VALUES]);
  });

  it("encodes the editor-facing constraints", () => {
    const schema = JSON.parse(readCommitted());
    const { properties } = schema.items;

    for (const key of ["categories", "platforms", "features", "keywords"]) {
      expect(properties[key].uniqueItems, key).toBe(true);
    }

    expect(properties.addedAt.format).toBe("date");
    expect(properties.description.minLength).toBe(
      FIELD_LIMITS.descriptionMinLength,
    );
    expect(properties.features.maxItems).toBe(FIELD_LIMITS.featuresMax);
    expect(properties.keywords.items.maxLength).toBe(
      FIELD_LIMITS.keywordMaxLength,
    );

    const website = properties.links.properties.website;
    expect(website.format).toBe("uri");
    expect(website.maxLength).toBe(FIELD_LIMITS.urlMaxLength);

    expect(schema.title).toBeTruthy();
    expect(schema.description).toContain("跨记录约束");
  });

  it("describes exactly the shape of data/tools.json", () => {
    const { items } = JSON.parse(readCommitted());
    const schemaKeys = Object.keys(items.properties).sort();
    const linkSchemaKeys = Object.keys(
      items.properties.links.properties,
    ).sort();

    // schema 的 required 与 data 的实际键必须完全一致，否则编辑器会误报/漏报。
    expect([...items.required].sort()).toEqual(schemaKeys);
    expect(
      [...new Set(rawTools.flatMap((tool) => Object.keys(tool)))].sort(),
    ).toEqual(schemaKeys);

    expect([...items.properties.links.required].sort()).toEqual(linkSchemaKeys);
    expect(
      [...new Set(rawTools.flatMap((tool) => Object.keys(tool.links)))].sort(),
    ).toEqual(linkSchemaKeys);
  });

  it("enforces https on every link", () => {
    const { properties } = JSON.parse(readCommitted()).items;
    const httpsPattern = "^https:\\/\\/";
    expect(properties.links.properties.website.pattern).toBe(httpsPattern);
    for (const key of ["github", "docs", "pricing", "store"]) {
      expect(properties.links.properties[key].anyOf).toContainEqual(
        expect.objectContaining({ type: "string", pattern: httpsPattern }),
      );
    }
  });
});
