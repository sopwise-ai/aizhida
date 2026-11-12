"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily:
            "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
          background: "#0d0b10",
          color: "#f6f3ee",
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>应用出现故障</p>
        <h1 style={{ fontSize: 24, margin: 0 }}>页面崩溃了</h1>
        <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
          {error.digest
            ? `错误编号：${error.digest}`
            : "请重试，若持续出现请稍后再访问。"}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            borderRadius: 10,
            border: "1px solid rgba(246,243,238,0.3)",
            background: "transparent",
            color: "inherit",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          重新加载
        </button>
      </body>
    </html>
  );
}
