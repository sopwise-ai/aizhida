# AI 直达（aizhida）

精选 AI 工具导航站。只收王牌，一键直达官网。

- **85 个精选工具**：写作、绘画、编程、办公、视频、Agent 六个分类
- **搜索与筛选**：支持中英文、分类/定价/平台/开源等关键词别名；分类、定价、授权可组合筛选
- **可分享状态**：搜索和筛选写入 URL，刷新、复制链接、浏览器后退都能恢复
- **真实品牌 Logo**：本地存放 60+ 个工具品牌图标，无运行时 favicon 请求
- **整卡直达**：点击卡片直接打开官网，不做中转页，也没有详情页
- **深色模式**：跟随系统，也可手动切换
- **键盘操作**：`⌘K` / `Ctrl+K` 聚焦搜索，`Esc` 清空；完整的 focus ring 与跳转链接
- **提交表单**：实时预览、校验、复制 JSON、生成 GitHub Issue；可选邮件入口
- **纯静态**：无后端、无数据库、无登录、无第三方统计；搜索与筛选全部在浏览器本地完成

视觉参考 [Heroicons](https://heroicons.com)：violet 品牌色、beams 背景、全宽搜索带、胶囊分类、圆角卡片、克制的字号层级与留白。

## 预览

![首页](docs/preview-home.png)

深色模式：[docs/preview-dark.png](docs/preview-dark.png) · 移动端：[docs/preview-mobile.png](docs/preview-mobile.png) · 收录标准：[docs/preview-about.png](docs/preview-about.png) · 提交工具：[docs/preview-submit.png](docs/preview-submit.png)

## 技术栈

Next.js 16 App Router、React 19、Tailwind CSS v4、Geist 字体、zod；
交互组件使用 shadcn/ui 风格的 Radix Select / ToggleGroup / Tooltip / DropdownMenu，主题切换使用 next-themes。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # Biome
pnpm build      # 生产构建，同时校验 tools.json
pnpm start      # 运行生产构建
```

## 数据

唯一数据源是 `data/tools.json`，结构由 `lib/tools.ts` 里的 zod schema 在构建期校验。字段不合法时 `pnpm build` 会直接失败。

```json
{
  "id": "cursor",
  "name": "Cursor",
  "url": "https://cursor.com",
  "desc": "内置 AI 的代码编辑器，可对话式修改项目。",
  "categories": ["coding", "agent"],
  "pricing": "freemium",
  "openSource": false,
  "platform": "desktop",
  "tags": ["编辑器", "代码补全", "ai"]
}
```

| 字段 | 说明 |
| --- | --- |
| `id` | 小写字母、数字、连字符，全局唯一，用于去重与 Logo 映射 |
| `name` | 官方产品名，不超过 30 字 |
| `url` | 官网地址，必须 https，不带 UTM / 返佣参数 |
| `desc` | 客观一句话，8–60 字，不写「最强」「第一」 |
| `categories` | 1–2 个：`writing` / `image` / `coding` / `productivity` / `video` / `agent` |
| `pricing` | `free` / `freemium` / `paid` / `trial` |
| `openSource` | 布尔值 |
| `platform` | 主平台：`web` / `desktop` / `api` / `plugin` / `mobile` |
| `tags` | 1–5 个检索词，小写，每个不超过 12 字 |

不采集 Star 数、热度排名或「最近更新」——无法核验的数字不进入数据。

### 新增一个工具

1. 在 `data/tools.json` 中插入一条记录（顺序就是首页展示顺序）。
2. 确认 `id` 不重复、`url` 可访问、分类与定价取值合法。
3. 如有品牌图标，放到 `public/logos/{id}.svg|png`，并在 `lib/tool-logos.json` 增加映射；没有图标会显示首字母兜底。
4. 跑 `pnpm build`；schema 校验通过后该工具会自动出现在首页列表。

## 站点地址与可选配置

复制 `.env.example` 为 `.env.local`：

```bash
NEXT_PUBLIC_SITE_URL=https://你的域名
# 可选：提交工具的备用邮箱；留空则只显示复制 JSON 与 GitHub Issue
NEXT_PUBLIC_CONTACT_EMAIL=
```

未设置 `NEXT_PUBLIC_SITE_URL` 时统一回退到 `http://localhost:3000`；正式部署前必须配置真实域名，否则 canonical、sitemap 和社交卡片都会指向 localhost。

## 部署

任意支持 Next.js 的静态/Node 托管均可（Vercel 最省事）。页面全部静态生成，不需要运行时数据库。部署后在浏览器 Network 面板确认 `Content-Encoding` 为 `br` 或 `gzip`。

## 首页排序

`data/tools.json` 的顺序就是首页展示顺序。前 24 条是人工编排的跨分类精选位，用来保证首屏能看到写作、绘画、编程、办公、视频与 Agent 的代表工具，并包含 DeepSeek、Kimi、豆包、通义、即梦等中文工具。

## 范围

不做：登录、收藏、付费、广告、第三方分析、工具详情页、虚拟列表。搜索、筛选、排序说明与提交数据均在本地/静态层完成。
