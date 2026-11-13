/**
 * 站点 URL 解析与校验（纯函数，无进程/环境依赖）。
 *
 * 单独成模块的原因：这是唯一需要「构建期失败」的业务逻辑，
 * 提炼成纯函数后可以直接单测，不必在测试里反复 import 带副作用的模块。
 */

export interface SiteUrlInput {
  /** NEXT_PUBLIC_SITE_URL，构建期注入。 */
  siteUrl?: string | undefined;
  /** VERCEL_PROJECT_PRODUCTION_URL 或 VERCEL_URL，只含主机名。 */
  vercelUrl?: string | undefined;
  /** NODE_ENV === "production"。 */
  isProduction: boolean;
  /** 开发环境本地端口，默认 3000。 */
  port?: string | undefined;
}

export const PRODUCTION_MISSING_MESSAGE =
  "生产构建必须提供 NEXT_PUBLIC_SITE_URL（或部署在 Vercel 上）。请复制 .env.example 为 .env.local 并填写站点地址。";

/**
 * 返回去掉尾部斜杠、去掉 query/hash 的站点根地址。
 * 生产环境额外要求 https 且不能指向本地地址；
 * 开发环境允许 http 与 localhost，缺省回落到 `http://localhost:{port}`。
 */
export function resolveSiteUrl({
  siteUrl,
  vercelUrl,
  isProduction,
  port,
}: SiteUrlInput): string {
  if (siteUrl?.trim()) {
    return normalize(
      parse(siteUrl.trim(), "NEXT_PUBLIC_SITE_URL"),
      "NEXT_PUBLIC_SITE_URL",
      isProduction,
    );
  }

  if (vercelUrl?.trim()) {
    // Vercel 提供的是裸主机名；容忍误填成 https://host 的情况。
    const host = vercelUrl
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    return normalize(
      parse(`https://${host}`, "VERCEL_URL"),
      "VERCEL_URL",
      isProduction,
    );
  }

  if (isProduction) {
    throw new Error(PRODUCTION_MISSING_MESSAGE);
  }

  return `http://localhost:${port?.trim() || "3000"}`;
}

function parse(value: string, source: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${source} 不是合法的绝对地址：${value}`);
  }
}

function normalize(url: URL, source: string, isProduction: boolean): string {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `${source} 必须是 http(s) 地址，当前协议是 ${url.protocol}`,
    );
  }

  if (!url.hostname) {
    throw new Error(`${source} 缺少主机名：${url.href}`);
  }

  if (url.username || url.password) {
    throw new Error(`${source} 不能包含用户名或密码。`);
  }

  if (isProduction) {
    if (url.protocol !== "https:") {
      throw new Error(`${source} 在生产构建中必须使用 https。`);
    }
    if (isLocalAddress(url.hostname)) {
      throw new Error(
        `${source} 在生产构建中不能指向本地地址：${url.hostname}`,
      );
    }
  }

  // 站点根地址不应该带 query/hash；拼绝对链接时它们会污染 canonical。
  url.search = "";
  url.hash = "";
  return url.href.replace(/\/+$/, "");
}

/** 覆盖 localhost、回环网段与 *.localhost（RFC 6761）。 */
function isLocalAddress(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");

  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host.startsWith("127.") ||
    host === "::1" ||
    host.startsWith("::ffff:127.")
  );
}
