import { z } from "zod";
import {
  CATEGORY_VALUES,
  FEATURE_VALUES,
  FIELD_LIMITS,
  PLATFORM_VALUES,
  PRICING_VALUES,
  STATUS_VALUES,
  TYPE_VALUES,
} from "./tool-meta.ts";

/**
 * 单条工具记录的权威 schema。
 *
 * 刻意不在这里 import `data/tools.json`：数组级校验在 lib/tools.ts，
 * 这个模块只描述「一条记录长什么样」，因而可以被脚本直接加载，
 * 生成 data/schema/tools.schema.json。
 *
 * 长度预算集中在 lib/tool-meta.ts 的 FIELD_LIMITS，提交表单复用同一组数字。
 * 根对象与 links 都用 `.strict()`：拼写错误（`platfroms`、`gihub`）会让构建
 * 失败，而不是被 zod 静默丢弃——与 JSON Schema 的 additionalProperties 一致。
 *
 * 跨记录约束（id 唯一、官网唯一、vendorId 外键、日期先后）无法用 JSON Schema
 * 表达，由 lib/tools.ts 的 toolsSchema 在构建期兜底。
 */

/** 工具与厂商 id 共用的 slug 规则；tools.ts 的 vendorsSchema 也复用它。 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const httpsUrl = z
  // z.string().url() 在 zod 4 已废弃，直接用 z.url()。
  .url("url 不是合法链接")
  .max(
    FIELD_LIMITS.urlMaxLength,
    `url 最多 ${FIELD_LIMITS.urlMaxLength} 个字符`,
  )
  // 用 regex 而不是 refine：JSON Schema 才能保留 pattern。
  .regex(/^https:\/\//, "url 必须以小写 https:// 开头")
  // 公开链接不应内嵌账号密码（粘贴事故最容易带进来）。
  .refine((value) => {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      // 解析失败已由 z.url() 报错，这里不重复报同一问题。
      return true;
    }
    return !url.username && !url.password;
  }, "url 不能包含账号或密码")
  // z.url() 的 format 会被后续 regex 覆盖，这里补回 uri 供编辑器校验。
  .meta({ format: "uri" });

const keywordSchema = z
  .string()
  .min(1, "关键词不能为空")
  .max(
    FIELD_LIMITS.keywordMaxLength,
    `关键词最多 ${FIELD_LIMITS.keywordMaxLength} 个字符`,
  )
  .refine(notPadded, "关键词不能包含首尾空格")
  .refine((value) => value === value.toLowerCase(), "关键词必须小写");

// z.iso.date() 校验真实日历日期（闰年、大小月），并在 JSON Schema 输出 format: date。
const isoDate = z.iso.date({
  error: "日期必须是真实存在的 YYYY-MM-DD（如 2026-11-11）",
});

function distinct<T>(values: T[]): boolean {
  return new Set(values).size === values.length;
}

/** 文本字段不接受首尾空格：脏数据会让卡片排版和搜索匹配都不稳定。 */
function notPadded(value: string): boolean {
  return value === value.trim();
}

export const toolSchema = z
  .object({
    id: z
      .string()
      .max(
        FIELD_LIMITS.idMaxLength,
        `id 最多 ${FIELD_LIMITS.idMaxLength} 个字符`,
      )
      .regex(SLUG_PATTERN, "id 只能包含小写字母、数字和连字符"),
    name: z
      .string()
      .min(1, "名称不能为空")
      .max(
        FIELD_LIMITS.nameMaxLength,
        `名称最多 ${FIELD_LIMITS.nameMaxLength} 个字符`,
      )
      .refine(notPadded, "名称不能包含首尾空格"),
    vendorId: z
      .string()
      .max(
        FIELD_LIMITS.vendorIdMaxLength,
        `vendorId 最多 ${FIELD_LIMITS.vendorIdMaxLength} 个字符`,
      )
      .regex(SLUG_PATTERN, "vendorId 只能包含小写字母、数字和连字符"),
    categories: z
      .array(z.enum(CATEGORY_VALUES))
      .min(1, "至少一个分类")
      .max(
        FIELD_LIMITS.categoriesMax,
        `最多 ${FIELD_LIMITS.categoriesMax} 个分类`,
      )
      .refine(distinct, "分类不能重复")
      .meta({ uniqueItems: true }),
    type: z.enum(TYPE_VALUES),
    platforms: z
      .array(z.enum(PLATFORM_VALUES))
      .min(1, "至少一个平台")
      .max(PLATFORM_VALUES.length, `平台最多 ${PLATFORM_VALUES.length} 个`)
      .refine(distinct, "平台不能重复")
      .meta({ uniqueItems: true }),
    pricing: z.enum(PRICING_VALUES),
    openSource: z.boolean(),
    status: z.enum(STATUS_VALUES),
    tagline: z
      .string()
      .min(
        FIELD_LIMITS.taglineMinLength,
        `一句话说明至少 ${FIELD_LIMITS.taglineMinLength} 个字符`,
      )
      .max(
        FIELD_LIMITS.taglineMaxLength,
        `一句话说明最多 ${FIELD_LIMITS.taglineMaxLength} 个字符`,
      )
      .refine(notPadded, "一句话说明不能包含首尾空格"),
    description: z
      .string()
      .min(
        FIELD_LIMITS.descriptionMinLength,
        `详情描述至少 ${FIELD_LIMITS.descriptionMinLength} 个字符`,
      )
      .max(
        FIELD_LIMITS.descriptionMaxLength,
        `详情描述最多 ${FIELD_LIMITS.descriptionMaxLength} 个字符`,
      )
      .refine(notPadded, "详情描述不能包含首尾空格"),
    features: z
      .array(z.enum(FEATURE_VALUES))
      .min(FIELD_LIMITS.featuresMin, `至少 ${FIELD_LIMITS.featuresMin} 个特性`)
      .max(FIELD_LIMITS.featuresMax, `最多 ${FIELD_LIMITS.featuresMax} 个特性`)
      .refine(distinct, "特性不能重复")
      .meta({ uniqueItems: true }),
    keywords: z
      .array(keywordSchema)
      .max(
        FIELD_LIMITS.keywordsMax,
        `关键词最多 ${FIELD_LIMITS.keywordsMax} 个`,
      )
      .refine(distinct, "关键词不能重复")
      .meta({ uniqueItems: true }),
    links: z
      .object({
        website: httpsUrl,
        github: httpsUrl.nullable(),
        docs: httpsUrl.nullable(),
        pricing: httpsUrl.nullable(),
        store: httpsUrl.nullable(),
      })
      .strict(),
    affiliateUrl: httpsUrl.nullable(),
    sponsored: z.boolean(),
    addedAt: isoDate,
    updatedAt: isoDate,
    verifiedAt: isoDate,
  })
  .strict();
