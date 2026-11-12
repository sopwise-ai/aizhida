"use client";

import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL, REPO_URL } from "@/lib/site";
import {
  CATEGORIES,
  type Category,
  categoryLabel,
  FEATURE_GROUPS,
  FEATURES,
  type Feature,
  featureLabel,
  PLATFORMS,
  type Platform,
  PRICING_OPTIONS,
  type Pricing,
  platformLabel,
  pricingLabel,
  TOOL_TYPES,
  type ToolType,
  typeLabel,
} from "@/lib/tool-meta";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  vendor: string;
  url: string;
  tagline: string;
  categories: Category[];
  type: ToolType;
  platforms: Platform[];
  pricing: Pricing;
  openSource: boolean;
  features: Feature[];
  keywords: string;
}

const INITIAL: FormState = {
  name: "",
  vendor: "",
  url: "",
  tagline: "",
  categories: [],
  type: "app",
  platforms: ["web"],
  pricing: "freemium",
  openSource: false,
  features: [],
  keywords: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function domainFallback(url: string): string {
  return hostOf(url).split(".")[0] || "new-tool";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fieldClass(hasError: boolean) {
  return cn(
    "h-10 rounded-lg border-border bg-background text-[13px] shadow-none",
    hasError && "border-destructive focus-visible:border-destructive",
  );
}

function chipClass(active: boolean) {
  return cn(
    "focus-visible:ring-brand/35 h-9 rounded-lg border px-2.5 text-[12px] transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
    active
      ? "border-brand/40 bg-brand-soft text-brand"
      : "border-border bg-background text-muted-foreground hover:border-brand/30 hover:text-foreground",
  );
}

export function SubmitForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jsonRef = useRef<HTMLPreElement>(null);

  const keywords = useMemo(
    () =>
      form.keywords
        .split(/[,，]/)
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 6),
    [form.keywords],
  );

  const payload = useMemo(() => {
    const id = slugify(form.name) || domainFallback(form.url);
    const vendorId = slugify(form.vendor) || domainFallback(form.url);
    const date = today();

    return {
      id,
      name: form.name.trim() || "工具名称",
      vendorId,
      categories: form.categories.length ? form.categories : ["assistant"],
      type: form.type,
      platforms: form.platforms.length ? form.platforms : ["web"],
      pricing: form.pricing,
      openSource: form.openSource,
      status: "active",
      tagline: form.tagline.trim() || "一句话说明它做什么。",
      description: "",
      features: form.features,
      keywords,
      links: {
        website: form.url.trim() || "https://example.com",
        github: null,
        docs: null,
        pricing: null,
        store: null,
      },
      affiliateUrl: null,
      sponsored: false,
      addedAt: date,
      updatedAt: date,
      verifiedAt: date,
    };
  }, [form, keywords]);

  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function toggleCategory(category: Category) {
    setForm((previous) => {
      if (previous.categories.includes(category)) {
        return {
          ...previous,
          categories: previous.categories.filter((item) => item !== category),
        };
      }
      if (previous.categories.length >= 3) return previous;
      return { ...previous, categories: [...previous.categories, category] };
    });
    setErrors((previous) => {
      if (!previous.categories) return previous;
      const next = { ...previous };
      delete next.categories;
      return next;
    });
  }

  function togglePlatform(platform: Platform) {
    setForm((previous) => {
      if (previous.platforms.includes(platform)) {
        return {
          ...previous,
          platforms: previous.platforms.filter((item) => item !== platform),
        };
      }
      return { ...previous, platforms: [...previous.platforms, platform] };
    });
    setErrors((previous) => {
      if (!previous.platforms) return previous;
      const next = { ...previous };
      delete next.platforms;
      return next;
    });
  }

  function toggleFeature(feature: Feature) {
    setForm((previous) => {
      if (previous.features.includes(feature)) {
        return {
          ...previous,
          features: previous.features.filter((item) => item !== feature),
        };
      }
      if (previous.features.length >= 6) return previous;
      return { ...previous, features: [...previous.features, feature] };
    });
    setErrors((previous) => {
      if (!previous.features) return previous;
      const next = { ...previous };
      delete next.features;
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "请填写工具名称。";
    else if (form.name.trim().length > 30) next.name = "名称不要超过 30 个字。";
    if (!form.url.trim()) next.url = "请填写官网地址。";
    else {
      try {
        const parsed = new URL(form.url.trim());
        if (parsed.protocol !== "https:")
          next.url = "官网地址必须以 https:// 开头。";
      } catch {
        next.url = "请输入完整、有效的官网地址。";
      }
    }
    const taglineLength = form.tagline.trim().length;
    if (taglineLength < 8)
      next.tagline = "一句话说明至少写 8 个字，讲清楚它能做什么。";
    else if (taglineLength > 60) next.tagline = "一句话说明不要超过 60 个字。";
    if (form.categories.length === 0) next.categories = "请选择 1–3 个分类。";
    if (form.platforms.length === 0) next.platforms = "请至少选择一个平台。";
    if (form.features.length < 2)
      next.features = "请至少选择 2 个特性，方便检索与筛选。";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const target = next.name
        ? "tool-name"
        : next.url
          ? "tool-url"
          : next.tagline
            ? "tool-tagline"
            : next.categories
              ? `tool-category-${CATEGORIES[0].value}`
              : next.platforms
                ? "tool-platform-web"
                : `tool-feature-${FEATURES[0].value}`;
      requestAnimationFrame(() => {
        document.getElementById(target)?.focus();
      });
      return false;
    }
    return true;
  }

  async function copyText(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copiedByFallback = document.execCommand("copy");
      textarea.remove();
      return copiedByFallback;
    }
  }

  async function copyJson() {
    if (!validate()) return;
    const ok = await copyText(json);
    setCopied(ok);
    if (ok) {
      toast.success("JSON 已复制");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } else {
      toast.info("已选中 JSON，按 ⌘C / Ctrl+C 复制");
      const node = jsonRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        node.scrollIntoView({ block: "center" });
      }
    }
  }

  function openIssue() {
    if (!validate()) return;
    const body = `### 工具信息

- 名称：${form.name.trim()}
- 厂商：${form.vendor.trim() || "未填写"}
- 官网：${form.url.trim()}
- 一句话说明：${form.tagline.trim()}
- 分类：${form.categories.map(categoryLabel).join(" / ")}
- 产品形态：${typeLabel(form.type)}
- 平台：${form.platforms.map(platformLabel).join(" / ")}
- 定价：${pricingLabel(form.pricing)}
- 是否开源：${form.openSource ? "是" : "否"}
- 特性：${form.features.map(featureLabel).join(" / ") || "未选择"}
- 关键词：${keywords.join(" / ") || "无"}

### JSON

\`\`\`json
${json}
\`\`\`

### 补充说明

（为什么值得收录、官网截图或相关链接）`;

    const issueUrl = `${REPO_URL}/issues/new?title=${encodeURIComponent(
      `[收录提交] ${form.name.trim()}`,
    )}&body=${encodeURIComponent(body)}`;
    window.open(issueUrl, "_blank", "noopener,noreferrer");
  }

  const mailto = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `[收录提交] ${form.name.trim() || "工具名称"}`,
      )}&body=${encodeURIComponent(json)}`
    : null;

  const previewPlatforms = form.platforms.map(platformLabel).join(" · ");
  const previewDomain = hostOf(form.url) || "example.com";

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
      <form
        className="border-border bg-card rounded-xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void copyJson();
        }}
        noValidate
      >
        <FieldGroup>
          <FieldSet>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel htmlFor="tool-name">
                  工具名称 <span className="text-brand">*</span>
                </FieldLabel>
                <Input
                  id="tool-name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="例如 Cursor"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={cn("mt-1.5", fieldClass(Boolean(errors.name)))}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.name ? (
                  <FieldError id="name-error">{errors.name}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="tool-vendor">厂商</FieldLabel>
                <Input
                  id="tool-vendor"
                  value={form.vendor}
                  onChange={(event) => setField("vendor", event.target.value)}
                  placeholder="例如 Anysphere"
                  className={cn("mt-1.5", fieldClass(false))}
                  autoComplete="off"
                  spellCheck={false}
                />
                <FieldDescription>
                  用于生成 vendorId，方便聚合同一厂商的产品。
                </FieldDescription>
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.url) || undefined}>
              <FieldLabel htmlFor="tool-url">
                官网地址 <span className="text-brand">*</span>
              </FieldLabel>
              <Input
                id="tool-url"
                type="url"
                inputMode="url"
                value={form.url}
                onChange={(event) => setField("url", event.target.value)}
                placeholder="https://example.com"
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "url-error" : undefined}
                className={cn("mt-1.5", fieldClass(Boolean(errors.url)))}
                autoComplete="url"
                spellCheck={false}
              />
              {errors.url ? (
                <FieldError id="url-error">{errors.url}</FieldError>
              ) : null}
            </Field>
          </FieldSet>

          <Field data-invalid={Boolean(errors.tagline) || undefined}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="tool-tagline">
                一句话说明 <span className="text-brand">*</span>
              </FieldLabel>
              <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                {form.tagline.trim().length}/60
              </span>
            </div>
            <Textarea
              id="tool-tagline"
              value={form.tagline}
              onChange={(event) => setField("tagline", event.target.value)}
              placeholder="它解决什么问题？例如：内置 AI 的代码编辑器，可对话式修改项目。"
              maxLength={60}
              rows={3}
              aria-invalid={Boolean(errors.tagline)}
              aria-describedby={errors.tagline ? "tagline-error" : undefined}
              className={cn(
                "border-border bg-background mt-1.5 min-h-20 rounded-lg text-[13px] shadow-none",
                errors.tagline &&
                  "border-destructive focus-visible:border-destructive",
              )}
            />
            {errors.tagline ? (
              <FieldError id="tagline-error">{errors.tagline}</FieldError>
            ) : null}
            <FieldDescription>
              详情页正文（120–300 字）由维护者在收录时补全。
            </FieldDescription>
          </Field>

          <FieldSet
            aria-describedby={
              errors.categories ? "categories-error" : undefined
            }
          >
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>
                分类 <span className="text-brand">*</span>
              </FieldLabel>
              <span className="text-muted-foreground text-[10px]">
                最多 3 个
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CATEGORIES.map((category) => {
                const active = form.categories.includes(category.value);
                const disabled = !active && form.categories.length >= 3;
                return (
                  <button
                    key={category.value}
                    id={`tool-category-${category.value}`}
                    type="button"
                    aria-pressed={active}
                    aria-invalid={Boolean(errors.categories)}
                    aria-describedby={
                      errors.categories ? "categories-error" : undefined
                    }
                    disabled={disabled}
                    onClick={() => toggleCategory(category.value)}
                    className={chipClass(active)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            {errors.categories ? (
              <FieldError id="categories-error" role="alert">
                {errors.categories}
              </FieldError>
            ) : null}
          </FieldSet>

          <FieldSet>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="tool-type">产品形态</FieldLabel>
                <Select
                  value={form.type}
                  onValueChange={(value) => setField("type", value as ToolType)}
                >
                  <SelectTrigger
                    id="tool-type"
                    aria-label="产品形态"
                    className="border-border bg-background mt-1.5 h-10 w-full rounded-lg text-[13px] shadow-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  应用、模型、编辑器、插件、平台、框架、API 服务或运行时。
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="tool-pricing">定价</FieldLabel>
                <Select
                  value={form.pricing}
                  onValueChange={(value) =>
                    setField("pricing", value as Pricing)
                  }
                >
                  <SelectTrigger
                    id="tool-pricing"
                    aria-label="定价"
                    className="border-border bg-background mt-1.5 h-10 w-full rounded-lg text-[13px] shadow-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {PRICING_OPTIONS.find((o) => o.value === form.pricing)?.hint}
                </FieldDescription>
              </Field>
            </div>
          </FieldSet>

          <FieldSet
            aria-describedby={errors.platforms ? "platforms-error" : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>
                使用平台 <span className="text-brand">*</span>
              </FieldLabel>
              <span className="text-muted-foreground text-[10px]">可多选</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PLATFORMS.map((platform) => {
                const active = form.platforms.includes(platform.value);
                return (
                  <button
                    key={platform.value}
                    id={`tool-platform-${platform.value}`}
                    type="button"
                    aria-pressed={active}
                    aria-invalid={Boolean(errors.platforms)}
                    aria-describedby={
                      errors.platforms ? "platforms-error" : undefined
                    }
                    onClick={() => togglePlatform(platform.value)}
                    className={chipClass(active)}
                  >
                    {platform.label}
                  </button>
                );
              })}
            </div>
            {errors.platforms ? (
              <FieldError id="platforms-error" role="alert">
                {errors.platforms}
              </FieldError>
            ) : null}
          </FieldSet>

          <FieldSet
            aria-describedby={errors.features ? "features-error" : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>
                特性 <span className="text-brand">*</span>
              </FieldLabel>
              <span className="text-muted-foreground text-[10px]">
                2–6 个，可多选
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2.5">
              {FEATURE_GROUPS.map((group) => (
                <div key={group.value}>
                  <p className="text-muted-foreground/80 mb-1 text-[10px] font-medium">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURES.filter(
                      (feature) => feature.group === group.value,
                    ).map((feature) => {
                      const active = form.features.includes(feature.value);
                      const disabled = !active && form.features.length >= 6;
                      return (
                        <button
                          key={feature.value}
                          id={`tool-feature-${feature.value}`}
                          type="button"
                          aria-pressed={active}
                          aria-invalid={Boolean(errors.features)}
                          aria-describedby={
                            errors.features ? "features-error" : undefined
                          }
                          disabled={disabled}
                          onClick={() => toggleFeature(feature.value)}
                          className={chipClass(active)}
                        >
                          {feature.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {errors.features ? (
              <FieldError id="features-error" role="alert">
                {errors.features}
              </FieldError>
            ) : null}
          </FieldSet>

          <Field>
            <FieldLabel htmlFor="tool-keywords">检索关键词</FieldLabel>
            <Input
              id="tool-keywords"
              value={form.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
              placeholder="例如：代码补全, 编辑器, ai"
              className={cn("mt-1.5", fieldClass(false))}
              autoComplete="off"
            />
            <FieldDescription>
              用逗号分隔，最多 6 个；只用于站内搜索，不参与筛选。
            </FieldDescription>
          </Field>

          <Field orientation="horizontal">
            <FieldLabel
              htmlFor="tool-open-source"
              className="border-border bg-background w-full cursor-pointer items-start gap-2.5 rounded-lg border p-3"
            >
              <input
                id="tool-open-source"
                type="checkbox"
                checked={form.openSource}
                onChange={(event) =>
                  setField("openSource", event.target.checked)
                }
                className="mt-0.5 size-4 accent-[var(--brand)]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium">
                  这个工具是开源的
                </span>
                <span className="text-muted-foreground block text-[10px] leading-4 font-normal">
                  仅在官网或仓库明确提供开放源代码时勾选。
                </span>
              </span>
            </FieldLabel>
          </Field>
        </FieldGroup>

        <div className="border-border mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <Button
            type="submit"
            size="sm"
            className="h-10 rounded-lg px-4"
            aria-label="校验表单并复制 JSON"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "已复制 JSON" : "复制 JSON"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openIssue}
            className="h-10 rounded-lg px-4"
          >
            <Github className="size-3.5" aria-hidden />
            打开 GitHub Issue
          </Button>
          {mailto ? (
            <a
              href={mailto}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-10 rounded-lg px-3",
              )}
            >
              <Mail className="size-3.5" aria-hidden />
              邮件提交
            </a>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-3 text-[10px] leading-4">
          需要 GitHub 账号才能创建 Issue；没有账号可以先复制 JSON 保存，
          稍后通过你常用的渠道发给维护者。
        </p>
      </form>

      <aside className="lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="eyebrow">实时预览</p>
        </div>
        <div className="border-border bg-card mt-2 rounded-xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
          <div className="flex items-start gap-3">
            <span className="border-border bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border text-[12px] font-semibold">
              {(form.name.trim() || "A").slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="truncate text-[15px] font-semibold">
                  {form.name.trim() || "工具名称"}
                </h2>
                <ArrowUpRight
                  className="text-muted-foreground mt-0.5 size-3.5"
                  aria-hidden
                />
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-[13px] leading-5">
                {form.tagline.trim() || "一句话说明它做什么。"}
              </p>
            </div>
          </div>
          <div className="border-border mt-3 flex items-center justify-between gap-3 border-t pt-3 text-[11px]">
            <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
              <span className="border-border bg-muted/50 text-muted-foreground inline-flex h-5 items-center rounded-md border px-1.5 font-medium">
                {form.categories.length
                  ? categoryLabel(form.categories[0] as Category)
                  : "分类"}
              </span>
              <span
                className={
                  form.pricing === "free"
                    ? "bg-brand-soft text-brand inline-flex h-5 items-center rounded-md px-1.5 font-medium"
                    : undefined
                }
              >
                {pricingLabel(form.pricing)}
              </span>
              {form.openSource ? (
                <span className="border-border bg-background text-muted-foreground inline-flex h-5 items-center rounded-md border px-1.5">
                  开源
                </span>
              ) : null}
            </span>
            <span className="text-muted-foreground max-w-[38%] shrink-0 truncate text-[11px]">
              {previewDomain}
            </span>
          </div>
          {previewPlatforms ? (
            <p className="text-muted-foreground border-border mt-2 border-t pt-2 text-[10px]">
              {previewPlatforms}
              {form.features.length
                ? ` · ${form.features.map(featureLabel).join(" / ")}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="border-border bg-muted/30 mt-4 rounded-xl border p-4">
          <p className="flex items-center gap-1.5 text-[12px] font-medium">
            <ShieldCheck className="text-brand size-3.5" aria-hidden />
            提交前自检
          </p>
          <ul className="text-muted-foreground mt-2 flex flex-col gap-1.5 text-[11px] leading-5">
            <li>官网能打开，且不是聚合页或镜像站。</li>
            <li>说明写「它能做什么」，不写「最强」「第一」。</li>
            <li>分类最多三个，平台与定价可核验。</li>
            <li>特性从固定词表里选，不要自造同义词。</li>
          </ul>
        </div>

        <div className="border-border bg-card mt-4 rounded-xl border p-4">
          <p className="text-[12px] font-medium">JSON</p>
          <pre
            ref={jsonRef}
            className="bg-muted/50 text-muted-foreground mt-2 max-h-72 overflow-auto rounded-md p-3 font-mono text-[10px] leading-5"
          >
            <code>{json}</code>
          </pre>
        </div>
      </aside>
    </div>
  );
}
