import { env } from "@/lib/env";
import { resolveSiteUrl } from "./site-url";

/**
 * 服务端站点配置：只在构建/SSR 期间求值，非法值直接让构建失败。
 *
 * 客户端禁止导入本模块（biome.json 的 noRestrictedImports 会报错）：
 * 它依赖 env.ts，而 env.ts 会把 zod 带进浏览器包；文案常量请用
 * `@/lib/site-meta`。
 */
export const SITE_URL = resolveSiteUrl({
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
  vercelUrl:
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
  isProduction: process.env.NODE_ENV === "production",
  port: process.env.PORT,
});
