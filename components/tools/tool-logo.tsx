import type { ToolSummary } from "@/lib/tool-summary";

/**
 * 工具品牌标的统一入口：有本地 logo 就渲染图片，没有就用同色系首字母占位。
 * 卡片、跑马灯、精选面板、详情页、⌘K 面板共用同一套占位样式，
 * 避免同一个工具在不同位置出现三种不同的"缺图"长相。
 */
export function ToolLogo({
  tool,
  iconSize,
}: {
  tool: Pick<ToolSummary, "name" | "logo">;
  /** 图标边长（px）；占位方块的字号按它推导。 */
  iconSize: number;
}) {
  if (tool.logo) {
    return (
      // biome-ignore lint/performance/noImgElement: local, fixed-size brand marks
      <img
        src={tool.logo}
        alt=""
        width={iconSize}
        height={iconSize}
        loading="lazy"
        decoding="async"
        className="object-contain"
        style={{ width: iconSize, height: iconSize }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="bg-brand-soft text-brand flex size-full items-center justify-center font-semibold"
      style={{ fontSize: Math.max(10, Math.round(iconSize * 0.52)) }}
    >
      {tool.name.slice(0, 1)}
    </span>
  );
}
