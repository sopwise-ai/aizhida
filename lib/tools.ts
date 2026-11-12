import { z } from "zod";
import rawTools from "@/data/tools.json";
import {
  CATEGORY_VALUES,
  FEATURE_VALUES,
  PLATFORM_VALUES,
  PRICING_VALUES,
  STATUS_VALUES,
  type Tool,
  TYPE_VALUES,
} from "./tool-meta";
import { vendors } from "./vendors";

const httpsUrl = z
  .string()
  .url("url 不是合法链接")
  .refine((url) => url.startsWith("https://"), "url 必须使用 https");

const keywordSchema = z
  .string()
  .min(1, "关键词不能为空")
  .max(12, "关键词最多 12 个字符")
  .refine((value) => value === value.toLowerCase(), "关键词必须小写");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须是 YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, "日期不合法");

function distinct<T>(values: T[]): boolean {
  return new Set(values).size === values.length;
}

export const toolSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id 只能包含小写字母、数字和连字符"),
  name: z.string().min(1, "名称不能为空").max(30, "名称最多 30 个字符"),
  vendorId: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "vendorId 只能包含小写字母、数字和连字符",
    ),
  categories: z
    .array(z.enum(CATEGORY_VALUES))
    .min(1, "至少一个分类")
    .max(3, "最多 3 个分类")
    .refine(distinct, "分类不能重复"),
  type: z.enum(TYPE_VALUES),
  platforms: z
    .array(z.enum(PLATFORM_VALUES))
    .min(1, "至少一个平台")
    .max(5, "平台最多 5 个")
    .refine(distinct, "平台不能重复"),
  pricing: z.enum(PRICING_VALUES),
  openSource: z.boolean(),
  status: z.enum(STATUS_VALUES),
  tagline: z
    .string()
    .min(8, "一句话说明至少 8 个字符")
    .max(60, "一句话说明最多 60 个字符"),
  description: z
    .string()
    .min(120, "详情描述至少 120 个字符")
    .max(300, "详情描述最多 300 个字符"),
  features: z
    .array(z.enum(FEATURE_VALUES))
    .min(2, "至少 2 个特性")
    .max(6, "最多 6 个特性")
    .refine(distinct, "特性不能重复"),
  keywords: z
    .array(keywordSchema)
    .max(6, "关键词最多 6 个")
    .refine(distinct, "关键词不能重复"),
  links: z.object({
    website: httpsUrl,
    github: httpsUrl.nullable(),
    docs: httpsUrl.nullable(),
    pricing: httpsUrl.nullable(),
    store: httpsUrl.nullable(),
  }),
  affiliateUrl: httpsUrl.nullable(),
  sponsored: z.boolean(),
  addedAt: isoDate,
  updatedAt: isoDate,
  verifiedAt: isoDate,
});

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

    const site = new URL(item.links.website);
    const key = `${site.hostname.replace(/^www\./, "")}${site.pathname.replace(/\/+$/, "")}`;
    if (seenSites.has(key)) {
      ctx.addIssue({
        code: "custom",
        message: `官网重复：${item.links.website}`,
        path: [index, "links", "website"],
      });
    }
    seenSites.add(key);

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
 * 客户端组件只通过 props 拿数据，不会把 zod 带进浏览器包。
 */
export const tools: Tool[] = toolsSchema.parse(rawTools);

const toolsById = new Map(tools.map((tool) => [tool.id, tool]));

export function getTool(id: string): Tool | undefined {
  return toolsById.get(id);
}
