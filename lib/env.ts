import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * 环境变量校验：构建期失败，t3-env 的报错会点名具体变量。
 *
 * 只放 `NEXT_PUBLIC_*`：这是纯静态站点，没有需要保密的运行时密钥。
 * 这里只做**语法**校验；部署策略（生产必须 https、禁止本地地址）
 * 属于业务规则，放在 `lib/url.ts`，避免规则各写一半。
 *
 * 客户端组件不要 import 本模块：会把 zod 与 @t3-oss/env-nextjs 带进
 * 浏览器包（实测约 90KB gzip），文案常量请用 `@/lib/site`；
 * `components/**` 已由 biome 的 noRestrictedImports 拦住。
 */
export const env = createEnv({
  server: {},
  client: {
    // 只允许 http(s)：挡掉 ftp:/mailto:/localhost:3000 这类“能被 URL 解析”的值。
    NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).optional(),
    NEXT_PUBLIC_CONTACT_EMAIL: z.email().optional(),
  },
  // Next 的 client 变量必须在 runtimeEnv 里显式列出，构建期才能正确内联。
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  },
  emptyStringAsUndefined: true,
});
