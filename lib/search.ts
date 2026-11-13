import {
  CATEGORY_VALUES,
  type Category,
  categoryLabel,
  FEATURE_VALUES,
  type Feature,
  featureLabel,
  type OpenSourceFilter,
  PLATFORM_VALUES,
  type Platform,
  PRICING_VALUES,
  type Pricing,
  platformLabel,
  pricingLabel,
  statusLabel,
  typeLabel,
} from "./meta";
import type { ToolSummary } from "./summary";
import { vendorName } from "./vendors";

export interface ToolFilters {
  query: string;
  categories: Category[];
  pricing: Pricing | "all";
  openSource: OpenSourceFilter;
  platforms: Platform[];
  features: Feature[];
}

export const DEFAULT_FILTERS: ToolFilters = {
  query: "",
  categories: [],
  pricing: "all",
  openSource: "all",
  platforms: [],
  features: [],
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
  ["视频", "剪辑", "短视频", "数字人", "字幕", "video", "film"],
  ["语音", "声音", "配音", "朗读", "tts", "audio", "voice"],
  ["agent", "智能体", "代理", "自动化", "工作流", "workflow"],
  ["搜索", "检索", "research", "search", "资料"],
  ["基础设施", "模型", "框架", "部署", "infrastructure", "llm"],
  ["免费", "free", "白嫖", "免费使用"],
  ["开源", "open source", "oss", "开放源代码", "本地部署"],
  ["中文", "国产", "中国", "chinese"],
  ["api", "接口", "开发者"],
  ["插件", "plugin", "扩展"],
  ["桌面", "desktop", "客户端"],
  ["移动", "mobile", "手机", "app"],
] as const;

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKC");
}

const NORMALIZED_ALIAS_GROUPS = ALIAS_GROUPS.map((group) =>
  group.map((item) => normalize(item)),
);

function isCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

/**
 * 中文允许双向子串（"聊" ↔ "聊天"）；ASCII 只认整词。
 * 否则 "chatgpt" 会因为包含 "chat" 被扩成整个聊天同义词组，
 * 搜具体产品名反而返回几十条弱相关结果。
 */
function aliasMatches(term: string, candidate: string): boolean {
  return isCjk(term)
    ? term.includes(candidate) || candidate.includes(term)
    : term === candidate;
}

function expandTerm(term: string): string[] {
  const normalized = normalize(term);
  const group = NORMALIZED_ALIAS_GROUPS.find((items) =>
    items.some((candidate) => aliasMatches(normalized, candidate)),
  );

  return group ? [normalized, ...group] : [normalized];
}

function searchHaystack(tool: ToolSummary): string {
  const categoryTerms = tool.categories.flatMap((category) => [
    category,
    categoryLabel(category),
  ]);
  const featureTerms = tool.features.flatMap((feature) => [
    feature,
    featureLabel(feature),
  ]);
  const platformTerms = tool.platforms.flatMap((platform) => [
    platform,
    platformLabel(platform),
  ]);

  return normalize(
    [
      tool.id,
      tool.name,
      tool.tagline,
      tool.vendorId,
      vendorName(tool.vendorId),
      ...tool.keywords,
      ...featureTerms,
      ...categoryTerms,
      ...platformTerms,
      tool.type,
      typeLabel(tool.type),
      pricingLabel(tool.pricing),
      tool.pricing,
      statusLabel(tool.status),
      tool.openSource ? "开源 open source" : "闭源 closed source",
      new URL(tool.website).hostname,
    ].join(" "),
  );
}

const TRAILING_PUNCTUATION = /[?？!！,，。;；:：]+$/u;

/** 去掉首尾空白与句末标点，避免 "ChatGPT？" 这类输入直接零结果。 */
function cleanQuery(value: string): string {
  return normalize(value.trim()).replace(TRAILING_PUNCTUATION, "");
}

function matchScore(tool: ToolSummary, rawQuery: string): number {
  const query = cleanQuery(rawQuery);
  if (!query) return 0;

  // A plain "免费" query should mean the free tier, not all 75 tools whose
  // pricing label contains the substring "免费".
  if (query === "免费" || query === "free") {
    return tool.pricing === "free" ? 200 : -1;
  }

  const name = normalize(tool.name);
  const attributes = [...tool.features, ...tool.keywords].map(normalize);
  const desc = normalize(tool.tagline);
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
  if (attributes.some((attribute) => attribute === query)) score += 40;
  if (desc.includes(query)) score += 15;
  score += terms.length * 2;
  return score;
}

export function matchesQuery(tool: ToolSummary, query: string): boolean {
  return matchScore(tool, query) >= 0;
}

/**
 * Same-dimension filters are OR (a tool can be in both writing and productivity),
 * different dimensions are AND.
 */
function matchesDimensionFilters(
  tool: ToolSummary,
  filters: ToolFilters,
): boolean {
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

  if (
    filters.platforms.length > 0 &&
    !filters.platforms.some((platform) => tool.platforms.includes(platform))
  ) {
    return false;
  }

  if (
    filters.features.length > 0 &&
    !filters.features.some((feature) => tool.features.includes(feature))
  ) {
    return false;
  }

  return true;
}

export function filterTools(
  tools: readonly ToolSummary[],
  filters: ToolFilters,
): ToolSummary[] {
  // 打分只做一次：原实现先 matchesQuery、再为排序重新 score，
  // 每条记录要算两遍 haystack（含一次 URL 解析）。
  const scored = tools
    .map((tool) => ({ tool, score: matchScore(tool, filters.query) }))
    .filter(
      ({ tool, score }) => score >= 0 && matchesDimensionFilters(tool, filters),
    );

  if (!filters.query.trim()) {
    return scored.map(({ tool }) => tool);
  }

  // 同分保持数据集顺序（Array.prototype.sort 自 ES2019 起稳定）。
  return scored.sort((a, b) => b.score - a.score).map(({ tool }) => tool);
}

export function isCategory(value: string | null): value is Category {
  return value !== null && CATEGORY_VALUES.includes(value as Category);
}

export function isPricing(value: string | null): value is Pricing {
  return value !== null && PRICING_VALUES.includes(value as Pricing);
}

export function isPlatform(value: string | null): value is Platform {
  return value !== null && PLATFORM_VALUES.includes(value as Platform);
}

export function isFeature(value: string | null): value is Feature {
  return value !== null && FEATURE_VALUES.includes(value as Feature);
}
