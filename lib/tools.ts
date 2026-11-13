import { z } from "zod";
import rawTools from "@/data/tools.json";
import { getToolLogo } from "./logos";
import { FIELD_LIMITS, type Tool } from "./meta";
import { SLUG_PATTERN, toolSchema } from "./schema";
import { type ToolSummary, toToolSummary } from "./summary";
import { vendors } from "./vendors";

// 单条记录的 schema 在 lib/schema.ts：那里不 import 数据文件，
// 才能被 scripts/generate-json-schema.ts 直接加载生成 JSON Schema。
export { toolSchema };

/**
 * 厂商注册表的结构与唯一性校验。放在构建期而不是只放测试：
 * vendorsById 是 Map，重复 id 会静默覆盖成"后写的赢"，这种数据
 * 必须让 next build 失败。vendors.ts 本身保持零依赖，客户端可安全导入。
 */
export const vendorsSchema = z
  .array(
    z
      .object({
        id: z
          .string()
          .max(
            FIELD_LIMITS.vendorIdMaxLength,
            `vendor id 最多 ${FIELD_LIMITS.vendorIdMaxLength} 个字符`,
          )
          .regex(SLUG_PATTERN, "vendor id 只能包含小写字母、数字和连字符"),
        name: z
          .string()
          .min(1, "厂商名称不能为空")
          .max(
            FIELD_LIMITS.vendorNameMaxLength,
            `厂商名称最多 ${FIELD_LIMITS.vendorNameMaxLength} 个字符`,
          ),
      })
      .strict(),
  )
  .superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          message: `vendor id 重复：${item.id}`,
          path: [index, "id"],
        });
      }
      seen.add(item.id);
    });
  });

/**
 * 官网唯一性判定键：忽略 www、结尾斜杠、query 与 hash，保留端口
 * （同域不同端口是不同服务）。抽成函数是为了让测试复用同一规则，
 * 而不是各写一份正则。
 */
export function canonicalSiteKey(website: string): string {
  const url = new URL(website);
  const host = url.host.replace(/^www\./, "");
  return `${host}${url.pathname.replace(/\/+$/, "")}`;
}

// 导出供测试直接构造数组级用例（重复 id / 未知厂商 / 日期矛盾等）。
export const toolsSchema = z.array(toolSchema).superRefine((items, ctx) => {
  const seenIds = new Set<string>();
  const seenSites = new Set<string>();
  const vendorIds = new Set(vendors.map((vendor) => vendor.id));

  items.forEach((item, index) => {
    if (seenIds.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: `id 重复：${item.id}`,
        path: [index, "id"],
      });
    }
    seenIds.add(item.id);

    if (!vendorIds.has(item.vendorId)) {
      ctx.addIssue({
        code: "custom",
        message: `未知 vendorId：${item.vendorId}`,
        path: [index, "vendorId"],
      });
    }

    // 官网非法时 z.url() 已单独报错；这里跳过重复检测，避免 safeParse 抛异常。
    let siteKey: string | null = null;
    try {
      siteKey = canonicalSiteKey(item.links.website);
    } catch {
      siteKey = null;
    }
    if (siteKey !== null) {
      if (seenSites.has(siteKey)) {
        ctx.addIssue({
          code: "custom",
          message: `官网重复：${item.links.website}`,
          path: [index, "links", "website"],
        });
      }
      seenSites.add(siteKey);
    }

    if (item.updatedAt < item.addedAt) {
      ctx.addIssue({
        code: "custom",
        message: "updatedAt 不能早于 addedAt",
        path: [index, "updatedAt"],
      });
    }
    if (item.verifiedAt > item.updatedAt) {
      ctx.addIssue({
        code: "custom",
        message: "verifiedAt 不能晚于 updatedAt",
        path: [index, "verifiedAt"],
      });
    }
  });
});

/**
 * 数据在模块加载时校验：任何非法字段都会让 next build 直接失败。
 * 客户端组件只通过 props 拿数据；lib/client-boundary.test.ts 会扫描
 * `"use client"` 文件，阻止它们导入本模块（避免 zod 进浏览器包）。
 */
export const tools: Tool[] = toolsSchema.parse(rawTools);

// vendors.json 与 tools.json 一样在构建期校验：非法/重复数据直接让 next build 失败。
vendorsSchema.parse(vendors);

/**
 * 首页与客户端交互只消费摘要：不含 description / links / 运营字段。
 * 详情页直接读 tools。
 */
export const toolSummaries: ToolSummary[] = tools.map((tool) =>
  toToolSummary(tool, getToolLogo(tool.id) ?? null),
);

const toolsById = new Map(tools.map((tool) => [tool.id, tool]));

export function getTool(id: string): Tool | undefined {
  return toolsById.get(id);
}
