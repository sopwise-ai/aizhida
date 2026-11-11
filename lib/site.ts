export const SITE_NAME = "AI 直达";
export const SITE_TAGLINE = "只收王牌，一键直达官网";
export const SITE_DESCRIPTION =
  "精选 AI 工具导航：写作、绘画、编程、办公、视频与 Agent 分类，按定价与是否开源筛选，一键直达官网。无需登录，搜索与筛选在浏览器本地完成。";
const vercelUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const fallbackUrl = vercelUrl
  ? `https://${vercelUrl}`
  : "http://localhost:3000";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl
).replace(/\/+$/, "");
export const REPO_URL = "https://github.com/sopwise-ai/aizhida";
export const DATA_UPDATED_AT = "2026-11";
export const DATA_UPDATED_LABEL = "2026 年 11 月";

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
