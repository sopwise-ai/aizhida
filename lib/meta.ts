/**
 * v2 受控词表。所有枚举值都必须是稳定 slug：可以出现在 URL、筛选参数和
 * 未来的英文站点里；中文只作为展示 label，不参与持久化。
 */

export const CATEGORIES = [
  {
    value: "assistant",
    label: "对话助手",
    description:
      "能连续对话、读长文与文件的通用助手，适合问答、写作与资料整理。",
  },
  {
    value: "writing",
    label: "写作",
    description:
      "生成、改写、润色与校对文本，覆盖营销文案、学术写作与日常表达。",
  },
  {
    value: "image",
    label: "绘画",
    description: "文生图、图生图与图像编辑，覆盖插画、海报、商品图与素材生产。",
  },
  {
    value: "video",
    label: "视频",
    description:
      "视频生成、剪辑、数字人口播与字幕转录，覆盖短视频与长视频工作流。",
  },
  {
    value: "audio",
    label: "语音",
    description: "语音合成、声音克隆与音频处理，适合配音、播客与有声内容。",
  },
  {
    value: "coding",
    label: "编程",
    description:
      "代码补全、生成、重构与自主编程代理，覆盖编辑器、终端与在线 IDE。",
  },
  {
    value: "productivity",
    label: "办公",
    description: "会议记录、笔记、日程、自动化与演示文稿，把重复工作交给 AI。",
  },
  {
    value: "search",
    label: "搜索",
    description: "带来源引用的 AI 搜索与研究工具，适合查资料、调研与事实核对。",
  },
  {
    value: "design",
    label: "设计",
    description: "平面设计、海报、矢量图与品牌视觉生成，适合快速出图与改稿。",
  },
  {
    value: "agent",
    label: "智能体",
    description:
      "可规划并执行多步任务的 AI 代理与工作流平台，覆盖编程、浏览与自动化。",
  },
  {
    value: "infrastructure",
    label: "基础设施",
    description:
      "模型运行时、开发框架与可自托管的平台，适合构建与部署 AI 应用。",
  },
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

/** 产品形态：谁在用什么形态的产品，和「跑在哪个平台」是两个维度。 */
export const TOOL_TYPES = [
  { value: "app", label: "应用" },
  { value: "model", label: "模型" },
  { value: "editor", label: "编辑器" },
  { value: "plugin", label: "插件" },
  { value: "platform", label: "平台" },
  { value: "framework", label: "框架" },
  { value: "api", label: "API 服务" },
  { value: "runtime", label: "运行时" },
] as const;

export type ToolType = (typeof TOOL_TYPES)[number]["value"];

export const TYPE_VALUES = TOOL_TYPES.map((item) => item.value) as [
  ToolType,
  ...ToolType[],
];

export function typeLabel(value: ToolType): string {
  return TOOL_TYPES.find((item) => item.value === value)?.label ?? value;
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

/** 交付渠道，多值：一个工具常常同时有网页版、客户端和 API。 */
export const PLATFORMS = [
  { value: "web", label: "网页" },
  { value: "desktop", label: "桌面" },
  { value: "mobile", label: "移动端" },
  { value: "api", label: "API" },
  { value: "extension", label: "扩展" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];

export const PLATFORM_VALUES = PLATFORMS.map((item) => item.value) as [
  Platform,
  ...Platform[],
];

export function platformLabel(value: Platform): string {
  return PLATFORMS.find((item) => item.value === value)?.label ?? value;
}

/**
 * 受控特性词表：既是筛选维度，也是卡片上的能力标签。
 * 自由词只允许放 keywords，不进这里——否则 1000 条数据会长出 500 个同义标签。
 */
export const FEATURE_GROUPS = [
  { value: "capability", label: "模型能力" },
  { value: "output", label: "产出形态" },
  { value: "workflow", label: "使用方式" },
  { value: "scenario", label: "适用场景" },
  { value: "attribute", label: "产品属性" },
] as const;

/** 特性分组：FEATURES.group 的合法取值，由 FEATURE_GROUPS 派生。 */
type FeatureGroup = (typeof FEATURE_GROUPS)[number]["value"];

export const FEATURES = [
  { value: "multimodal", label: "多模态", group: "capability" },
  { value: "long-context", label: "长文本", group: "capability" },
  { value: "file-upload", label: "文件解析", group: "capability" },
  { value: "image-understanding", label: "图像理解", group: "capability" },
  { value: "web-search", label: "联网搜索", group: "capability" },
  { value: "browser-control", label: "浏览器操控", group: "capability" },
  { value: "code-execution", label: "代码执行", group: "capability" },
  { value: "voice-input", label: "语音输入", group: "capability" },
  { value: "rewrite", label: "改写", group: "capability" },
  { value: "summarize", label: "摘要", group: "capability" },
  { value: "translation", label: "翻译", group: "capability" },
  { value: "text-to-image", label: "文生图", group: "output" },
  { value: "image-edit", label: "图像编辑", group: "output" },
  { value: "text-to-video", label: "文生视频", group: "output" },
  { value: "image-to-video", label: "图生视频", group: "output" },
  { value: "video-edit", label: "视频剪辑", group: "output" },
  { value: "tts", label: "语音合成", group: "output" },
  { value: "voice-clone", label: "声音克隆", group: "output" },
  { value: "avatar", label: "数字人", group: "output" },
  { value: "transcription", label: "转录字幕", group: "output" },
  { value: "slides", label: "演示文稿", group: "output" },
  { value: "charts", label: "图表生成", group: "output" },
  { value: "code-gen", label: "代码生成", group: "output" },
  { value: "website-gen", label: "网站生成", group: "output" },
  { value: "chat", label: "对话式", group: "workflow" },
  { value: "prompt-library", label: "提示词模板", group: "workflow" },
  { value: "workflow", label: "工作流编排", group: "workflow" },
  { value: "visual-builder", label: "可视化编排", group: "workflow" },
  { value: "multi-agent", label: "多代理", group: "workflow" },
  { value: "plugin-ecosystem", label: "插件生态", group: "workflow" },
  { value: "open-api", label: "开放 API", group: "workflow" },
  { value: "mcp", label: "MCP", group: "workflow" },
  { value: "skill", label: "Skills", group: "workflow" },
  { value: "cli", label: "命令行", group: "workflow" },
  { value: "ide", label: "编辑器集成", group: "workflow" },
  { value: "team", label: "团队协作", group: "workflow" },
  { value: "batch", label: "批量处理", group: "workflow" },
  { value: "self-host", label: "自托管", group: "workflow" },
  { value: "local-run", label: "本地运行", group: "workflow" },
  { value: "open-weights", label: "开放权重", group: "workflow" },
  { value: "marketing", label: "营销文案", group: "scenario" },
  { value: "academic", label: "学术写作", group: "scenario" },
  { value: "meeting", label: "会议记录", group: "scenario" },
  { value: "notes", label: "笔记", group: "scenario" },
  { value: "research", label: "检索研究", group: "scenario" },
  { value: "customer-service", label: "客服", group: "scenario" },
  { value: "ecommerce", label: "电商", group: "scenario" },
  { value: "game-art", label: "游戏美术", group: "scenario" },
  { value: "design", label: "设计制图", group: "scenario" },
  { value: "code-complete", label: "代码补全", group: "scenario" },
  { value: "refactor", label: "代码重构", group: "scenario" },
  { value: "testing", label: "单元测试", group: "scenario" },
  { value: "pair-programming", label: "结对编程", group: "scenario" },
  { value: "data-analysis", label: "数据分析", group: "scenario" },
  { value: "rag", label: "RAG", group: "scenario" },
  { value: "fine-tune", label: "微调", group: "scenario" },
  { value: "model-serving", label: "模型托管", group: "scenario" },
  { value: "chinese", label: "中文优化", group: "attribute" },
  { value: "commercial", label: "可商用", group: "attribute" },
  { value: "privacy", label: "隐私优先", group: "attribute" },
  { value: "enterprise", label: "企业级", group: "attribute" },
] as const satisfies readonly {
  value: string;
  label: string;
  group: FeatureGroup;
}[];

export type Feature = (typeof FEATURES)[number]["value"];

export const FEATURE_VALUES = FEATURES.map((item) => item.value) as [
  Feature,
  ...Feature[],
];

export function featureLabel(value: Feature): string {
  return FEATURES.find((item) => item.value === value)?.label ?? value;
}

const TOOL_STATUSES = [
  { value: "active", label: "正常" },
  { value: "beta", label: "公测" },
  { value: "deprecated", label: "已弃用" },
  { value: "dead", label: "已关停" },
] as const;

export type ToolStatus = (typeof TOOL_STATUSES)[number]["value"];

export const STATUS_VALUES = TOOL_STATUSES.map((item) => item.value) as [
  ToolStatus,
  ...ToolStatus[],
];

export function statusLabel(value: ToolStatus): string {
  return TOOL_STATUSES.find((item) => item.value === value)?.label ?? value;
}

export type OpenSourceFilter = "all" | "yes" | "no";

/**
 * 字段预算：lib/schema.ts 与提交表单共用，避免同一个数字在多处各写一份。
 *
 * 数字来源（不是拍脑袋）：
 * - name 30：列表/详情标题的排版预算；
 * - tagline 60：卡片两行的高度预算；
 * - description 80：中文摘要约 78–80 字，够写「是什么 + 适合谁 + 形态」；
 * - features 8：61 个特性值 + 生态标签（MCP/Skills）的余量；
 * - keyword 20：`stable diffusion`（16）这类英文检索词装得下；
 * - url 2048：浏览器事实上的 URL 上限。
 */
export const FIELD_LIMITS = {
  idMaxLength: 60,
  nameMaxLength: 30,
  vendorIdMaxLength: 60,
  vendorNameMaxLength: 40,
  categoriesMax: 3,
  taglineMinLength: 8,
  taglineMaxLength: 60,
  descriptionMinLength: 80,
  descriptionMaxLength: 300,
  featuresMin: 2,
  featuresMax: 8,
  keywordsMax: 6,
  keywordMaxLength: 20,
  urlMaxLength: 2048,
} as const;

interface ToolLinks {
  website: string;
  github: string | null;
  docs: string | null;
  pricing: string | null;
  store: string | null;
}

export interface Tool {
  id: string;
  name: string;
  vendorId: string;
  categories: Category[];
  type: ToolType;
  platforms: Platform[];
  pricing: Pricing;
  openSource: boolean;
  status: ToolStatus;
  /** 卡片、列表、搜索结果里的一句话。 */
  tagline: string;
  /** 详情页正文与 SEO 描述，120–300 字符。 */
  description: string;
  features: Feature[];
  keywords: string[];
  links: ToolLinks;
  affiliateUrl: string | null;
  sponsored: boolean;
  addedAt: string;
  updatedAt: string;
  verifiedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
}
