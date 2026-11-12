import type { Instrumentation } from "next";

// 结构化服务端错误日志：JSON 每行一条，方便在 Vercel/Docker 里直接采集。
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined;

  const message = (
    error instanceof Error ? error.message : String(error)
  ).slice(0, 1_000);

  // 丢弃 query string：URL 参数可能携带令牌、邮箱等敏感信息。
  console.error(
    JSON.stringify({
      level: "error",
      runtime: process.env.NEXT_RUNTIME ?? "unknown",
      message,
      digest,
      path: request.path.split("?")[0],
      method: request.method,
      route: context.routePath,
      routerKind: context.routerKind,
    }),
  );
};
