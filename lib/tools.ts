import { z } from "zod";
import rawTools from "@/data/tools.json";
import {
  CATEGORY_VALUES,
  PLATFORM_VALUES,
  PRICING_VALUES,
  type Tool,
} from "./tool-meta";

const tagSchema = z
  .string()
  .min(1, "标签不能为空")
  .max(12, "标签最多 12 个字符")
  .refine((tag) => tag === tag.toLowerCase(), "标签必须小写");

export const toolSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id 只能包含小写字母、数字和连字符"),
  name: z.string().min(1, "名称不能为空").max(30, "名称最多 30 个字符"),
  url: z
    .string()
    .url("url 不是合法链接")
    .refine((url) => url.startsWith("https://"), "url 必须使用 https"),
  desc: z.string().min(8, "说明至少 8 个字符").max(60, "说明最多 60 个字符"),
  categories: z.array(z.enum(CATEGORY_VALUES)).min(1).max(2),
  pricing: z.enum(PRICING_VALUES),
  openSource: z.boolean(),
  platform: z.enum(PLATFORM_VALUES),
  tags: z.array(tagSchema).min(1).max(5),
});

const toolsSchema = z.array(toolSchema).superRefine((items, ctx) => {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: `id 重复：${item.id}`,
        path: [index, "id"],
      });
    }
    seen.add(item.id);
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
