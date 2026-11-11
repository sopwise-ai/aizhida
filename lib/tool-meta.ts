export const CATEGORIES = [
  { value: "writing", label: "写作" },
  { value: "image", label: "绘画" },
  { value: "coding", label: "编程" },
  { value: "productivity", label: "办公" },
  { value: "video", label: "视频" },
  { value: "agent", label: "Agent" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((category) => category.value) as [
  Category,
  ...Category[],
];

export function categoryLabel(value: Category): string {
  return (
    CATEGORIES.find((category) => category.value === value)?.label ?? value
  );
}

export const PRICING_OPTIONS = [
  { value: "free", label: "免费", hint: "可免费使用核心功能" },
  { value: "freemium", label: "免费增值", hint: "免费额度 + 付费升级" },
  { value: "paid", label: "付费", hint: "需要订阅或付费使用" },
  { value: "trial", label: "试用", hint: "仅提供试用，之后付费" },
] as const;

export type Pricing = (typeof PRICING_OPTIONS)[number]["value"];

export const PRICING_VALUES = PRICING_OPTIONS.map((option) => option.value) as [
  Pricing,
  ...Pricing[],
];

export function pricingLabel(value: Pricing): string {
  return (
    PRICING_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export const PLATFORM_OPTIONS = [
  { value: "web", label: "网页" },
  { value: "desktop", label: "桌面" },
  { value: "api", label: "API" },
  { value: "plugin", label: "插件" },
  { value: "mobile", label: "移动端" },
] as const;

export type Platform = (typeof PLATFORM_OPTIONS)[number]["value"];

export const PLATFORM_VALUES = PLATFORM_OPTIONS.map(
  (option) => option.value,
) as [Platform, ...Platform[]];

export function platformLabel(value: Platform): string {
  return (
    PLATFORM_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export type OpenSourceFilter = "all" | "yes" | "no";

export interface Tool {
  id: string;
  name: string;
  url: string;
  desc: string;
  categories: Category[];
  pricing: Pricing;
  openSource: boolean;
  platform: Platform;
  tags: string[];
}
