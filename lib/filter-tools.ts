import {
  CATEGORY_VALUES,
  type Category,
  categoryLabel,
  type OpenSourceFilter,
  PLATFORM_OPTIONS,
  type Platform,
  type Pricing,
  platformLabel,
  pricingLabel,
  type Tool,
} from "./tool-meta";

export interface ToolFilters {
  query: string;
  categories: Category[];
  pricing: Pricing | "all";
  openSource: OpenSourceFilter;
}

export const DEFAULT_FILTERS: ToolFilters = {
  query: "",
  categories: [],
  pricing: "all",
  openSource: "all",
};

/**
 * People search with the words they use, not the words we happen to store.
 * Each group expands one query term to its common synonyms, so "聊天" finds
 * tools tagged "对话" without turning every search into a match-all.
 */
const ALIAS_GROUPS: readonly (readonly string[])[] = [
  ["聊天", "对话", "chat", "chatbot", "助手", "assistant", "问答"],
  ["写作", "文案", "润色", "改写", "论文", "学术", "writing", "copy"],
  ["绘画", "画图", "生图", "图像", "图片", "设计", "海报", "image", "art"],
  ["编程", "代码", "开发", "程序员", "coding", "code", "ide", "补全"],
  [
    "办公",
    "效率",
    "文档",
    "会议",
    "笔记",
    "表格",
    "演示",
    "ppt",
    "productivity",
  ],
  ["视频", "剪辑", "短视频", "数字人", "配音", "字幕", "video", "film"],
  ["agent", "智能体", "代理", "自动化", "工作流", "workflow", "自动化"],
  ["免费", "free", "白嫖", "免费使用"],
  ["开源", "open source", "oss", "开放源代码"],
  ["中文", "国产", "中国", "chinese"],
  ["api", "接口", "开发者"],
  ["插件", "plugin", "扩展"],
  ["桌面", "desktop", "客户端"],
  ["移动", "mobile", "手机", "app"],
] as const;

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKC");
}

function expandTerm(term: string): string[] {
  const normalized = normalize(term);
  const group = ALIAS_GROUPS.find((items) =>
    items.some((item) => {
      const candidate = normalize(item);
      return normalized.includes(candidate) || candidate.includes(normalized);
    }),
  );

  if (!group) return [normalized];
  return [normalized, ...group.map(normalize)];
}

function searchHaystack(tool: Tool): string {
  const categoryTerms = tool.categories.flatMap((category) => [
    category,
    categoryLabel(category),
  ]);
  const platform = PLATFORM_OPTIONS.find(
    (option) => option.value === tool.platform,
  );

  return normalize(
    [
      tool.name,
      tool.desc,
      ...tool.tags,
      ...categoryTerms,
      pricingLabel(tool.pricing),
      platformLabel(tool.platform),
      platform?.label ?? "",
      tool.openSource ? "开源 open source" : "闭源 closed source",
      new URL(tool.url).hostname,
    ].join(" "),
  );
}

function matchScore(tool: Tool, rawQuery: string): number {
  const query = normalize(rawQuery.trim());
  if (!query) return 0;

  // A plain "免费" query should mean the free tier, not all 75 tools whose
  // pricing label contains the substring "免费".
  if (query === "免费" || query === "free") {
    return tool.pricing === "free" ? 200 : -1;
  }

  const name = normalize(tool.name);
  const tags = tool.tags.map(normalize);
  const desc = normalize(tool.desc);
  const haystack = searchHaystack(tool);

  const terms = query.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    const variants = expandTerm(term);
    if (!variants.some((variant) => haystack.includes(variant))) {
      return -1;
    }
  }

  let score = 0;
  if (name === query) score += 120;
  else if (name.startsWith(query)) score += 80;
  else if (name.includes(query)) score += 50;
  if (tags.some((tag) => tag === query)) score += 40;
  if (desc.includes(query)) score += 15;
  score += terms.length * 2;
  return score;
}

export function matchesQuery(tool: Tool, query: string): boolean {
  return matchScore(tool, query) >= 0;
}

/**
 * Same-dimension filters are OR (a tool can be in both writing and productivity),
 * different dimensions are AND.
 */
export function filterTools(
  tools: readonly Tool[],
  filters: ToolFilters,
): Tool[] {
  const filtered = tools.filter((tool) => {
    if (!matchesQuery(tool, filters.query)) return false;

    if (
      filters.categories.length > 0 &&
      !filters.categories.some((category) => tool.categories.includes(category))
    ) {
      return false;
    }

    if (filters.pricing !== "all" && tool.pricing !== filters.pricing) {
      return false;
    }

    if (filters.openSource === "yes" && !tool.openSource) return false;
    if (filters.openSource === "no" && tool.openSource) return false;

    return true;
  });

  if (!filters.query.trim()) return filtered;

  return filtered
    .map((tool) => ({ tool, score: matchScore(tool, filters.query) }))
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool);
}

export function isCategory(value: string | null): value is Category {
  return value !== null && CATEGORY_VALUES.includes(value as Category);
}

export function isPricing(value: string | null): value is Pricing {
  return (
    value === "free" ||
    value === "freemium" ||
    value === "paid" ||
    value === "trial"
  );
}

export function isPlatform(value: string | null): value is Platform {
  return (
    value === "web" ||
    value === "desktop" ||
    value === "api" ||
    value === "plugin" ||
    value === "mobile"
  );
}
