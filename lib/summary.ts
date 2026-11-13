import type { Tool } from "./meta";

/**
 * 客户端只需要「能筛选、能搜索、能渲染卡片」的字段。
 * 详情描述、外链集合、运营字段留在服务端，避免 1000 条数据整包进 RSC payload。
 *
 * 这个模块刻意不 import zod 或完整的 tools 数据，客户端组件可以安全地
 * 只引用类型。
 */
export type ToolSummary = Pick<
  Tool,
  | "id"
  | "name"
  | "vendorId"
  | "categories"
  | "type"
  | "platforms"
  | "pricing"
  | "openSource"
  | "status"
  | "tagline"
  | "features"
  | "keywords"
> & {
  /** 扁平化官网地址：卡片、搜索、筛选都要用，省掉 links 对象的开销。 */
  website: string;
  /** 本地 logo 路径（public/logos/{id}.{ext}），无图时为 null。 */
  logo: string | null;
};

export function toToolSummary(
  tool: Tool,
  logo: string | null = null,
): ToolSummary {
  return {
    id: tool.id,
    name: tool.name,
    vendorId: tool.vendorId,
    categories: tool.categories,
    type: tool.type,
    platforms: tool.platforms,
    pricing: tool.pricing,
    openSource: tool.openSource,
    status: tool.status,
    tagline: tool.tagline,
    features: tool.features,
    keywords: tool.keywords,
    website: tool.links.website,
    logo,
  };
}
