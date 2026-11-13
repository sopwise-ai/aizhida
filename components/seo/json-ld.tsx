// biome-ignore-all lint/security/noDangerouslySetInnerHtml: 唯一的 JSON-LD 出口，内容来自构建期校验过的数据，并转义 "<" 防止提前闭合脚本。
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
