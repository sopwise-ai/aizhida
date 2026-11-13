/**
 * 站点文案与链接常量：客户端安全模块，**不依赖 env / zod**。
 *
 * 为什么单独拆出来：env.ts 会带进 zod 与 @t3-oss/env-nextjs（约 90KB gzip），
 * 而客户端组件只需要几个字符串（站名、标语、更新时间、仓库地址）。
 * `components/` 下禁止导入 `@/lib/site` / `@/lib/env`，见 biome.json。
 *
 * 需要站点 URL 或生产环境校验，请用 `@/lib/site`（仅限服务端）。
 */

export const SITE_NAME = "AI 直达";
export const SITE_TAGLINE = "只收王牌，一键直达官网";
export const SITE_DESCRIPTION =
  "精选 AI 工具导航：对话助手、写作、绘画、视频、语音、编程、办公、搜索、设计、智能体与基础设施分类，按定价、平台与是否开源筛选，一键直达官网。无需登录，搜索与筛选在浏览器本地完成。";
export const REPO_URL = "https://github.com/sopwise-ai/aizhida";

/** 最近一次数据核对月份（YYYY-MM）。展示文案由它派生，避免两处手写漂移。 */
export const DATA_UPDATED_AT = "2026-11";
export const DATA_UPDATED_LABEL = formatMonthLabel(DATA_UPDATED_AT);

/**
 * NEXT_PUBLIC_* 会被 Next 在构建期内联，客户端可以直接读；
 * 格式校验仍然发生在服务端（lib/env.ts 经 lib/site.ts 载入）。
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${year} 年 ${Number(month)} 月`;
}
