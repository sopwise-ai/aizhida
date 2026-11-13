import logoExtensions from "./tool-logos.json";

type LogoExtension = "svg" | "png";

/**
 * Logo 与工具 id 绑定：public/logos/{id}.{ext}。
 * 这样换官网域名不用改资产路径；客户端也不需要这份映射——
 * ToolSummary 已经带上了 logo 路径，见 lib/tools.ts。
 *
 * JSON 是生成/手工维护的资产索引：扩展名与"文件是否存在"由
 * lib/tool-logos.test.ts 校验（含反向检查，防止漏登记或死文件）。
 */
const LOGOS = logoExtensions as Record<string, LogoExtension>;

export function getToolLogo(id: string): string | undefined {
  // 用 hasOwn 而不是直接索引：`constructor`、`toString` 等原型键
  // 直接索引会命中 Object.prototype，返回不存在的路径。
  if (!Object.hasOwn(LOGOS, id)) return undefined;

  const extension = LOGOS[id];
  return extension ? `/logos/${id}.${extension}` : undefined;
}
