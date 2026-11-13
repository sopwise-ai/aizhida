import logoExtensions from "./tool-logos.json";

const LOGOS = logoExtensions as Record<string, "svg" | "png">;

/**
 * Logo 与工具 id 绑定：public/logos/{id}.{ext}。
 * 这样换官网域名不用改资产路径；客户端也不需要这份映射——
 * ToolSummary 已经带上了 logo 路径，见 lib/tools.ts。
 */
export function getToolLogo(id: string): string | undefined {
  const extension = LOGOS[id];
  return extension ? `/logos/${id}.${extension}` : undefined;
}
