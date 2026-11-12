import { env } from "@/lib/env";

const url = env.NEXT_PUBLIC_SITE_URL;
const vercelUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const fallbackUrl = vercelUrl
  ? `https://${vercelUrl}`
  : "http://localhost:3000";

// NEXT_PUBLIC_* 在构建期内联。生产环境站点地址必须显式提供，且不允许指向
// localhost，否则 sitemap、robots、OG 图会指向错误域名。
if (process.env.NODE_ENV === "production") {
  if (!url && !vercelUrl) {
    throw new Error(
      "生产构建必须提供 NEXT_PUBLIC_SITE_URL（或部署在 Vercel 上）。请复制 .env.example 为 .env.local 并填写站点地址。",
    );
  }

  if (
    url &&
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL 在生产构建中不能指向 localhost。");
  }
}

export const SITE_URL = (url ?? fallbackUrl).replace(/\/+$/, "");
export const SITE_NAME = "AI 直达";
export const SITE_TAGLINE = "只收王牌，一键直达官网";
export const SITE_DESCRIPTION =
  "精选 AI 工具导航：对话助手、写作、绘画、视频、语音、编程、办公、搜索、设计、智能体与基础设施分类，按定价、平台与是否开源筛选，一键直达官网。无需登录，搜索与筛选在浏览器本地完成。";
export const REPO_URL = "https://github.com/sopwise-ai/aizhida";
export const DATA_UPDATED_AT = "2026-11";
export const DATA_UPDATED_LABEL = "2026 年 11 月";
export const CONTACT_EMAIL = env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
